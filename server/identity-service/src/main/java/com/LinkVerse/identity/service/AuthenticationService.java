package com.LinkVerse.identity.service;

import com.LinkVerse.identity.dto.request.AuthenticationRequest;
import com.LinkVerse.identity.dto.request.IntrospectRequest;
import com.LinkVerse.identity.dto.request.LogoutRequest;
import com.LinkVerse.identity.dto.request.RefreshRequest;
import com.LinkVerse.identity.dto.response.AuthenticationResponse;
import com.LinkVerse.identity.dto.response.IntrospectResponse;
import com.LinkVerse.identity.entity.InvalidatedToken;
import com.LinkVerse.identity.entity.User;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.exception.ErrorCode;
import com.LinkVerse.identity.repository.InvalidatedTokenRepository;
import com.LinkVerse.identity.repository.UserRepository;
import com.LinkVerse.identity.repository.httpclient.NotificationClient;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    NotificationClient notificationClient;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String signerKey;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        User user;
        if ("admin".equalsIgnoreCase(request.getUsername())) {
            // Skip email verification if the username is "admin"
            user = userRepository.findByUsername("admin")
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        } else if (request.getUsername().contains("@")) {
            ResponseEntity<User> userResponse = notificationClient.getUserByEmail(request.getUsername());
            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                throw new AppException(ErrorCode.USER_NOT_EXISTED);
            }
            user = userResponse.getBody();
        } else {
            ResponseEntity<String> emailResponse = notificationClient.getUserEmail(request.getUsername());
            if (!emailResponse.getStatusCode().is2xxSuccessful() || emailResponse.getBody() == null) {
                throw new AppException(ErrorCode.EMAIL_NOT_FOUND);
            }
            String userEmail = emailResponse.getBody();
            user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Skip OTP verification if the username is "admin"
        if (!"admin".equalsIgnoreCase(request.getUsername())) {
            if (request.getOtp() == 0) {
                ResponseEntity<String> response = notificationClient.generateOtp(user.getEmail());
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new AppException(ErrorCode.OTP_GENERATION_FAILED);
                }

                throw new AppException(ErrorCode.OTP_SENT);
            }
            try {
                ResponseEntity<String> otpResponse = notificationClient.validateOtp(user.getEmail(), request.getOtp());
                if (!otpResponse.getStatusCode().is2xxSuccessful()) {
                    throw new AppException(ErrorCode.INVALID_OTP);
                }
            } catch (FeignException.BadRequest e) {
                throw new AppException(ErrorCode.INVALID_OTP);
            }
        }

        if (user.getDeletedAt() != null) {
            user.setDeletedAt(null);
        }
        userRepository.save(user);

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token.token)
                .expiryTime(token.expiryDate)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken = verifyToken(request.getToken());

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken());

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token.token)
                .expiryTime(token.expiryDate)
                .build();
    }

    private TokenInfo generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        Date issueTime = new Date();
        Date expiryTime = new Date(Instant.ofEpochMilli(issueTime.getTime())
                .plus(1, ChronoUnit.HOURS)
                .toEpochMilli());

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("LinkVerseND.com")
                .issueTime(issueTime)
                .expirationTime(expiryTime)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("userId", user.getId())
                .claim("ProfileID", user.getProfileId())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return new TokenInfo(jwsObject.serialize(), expiryTime);
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    public SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    private record TokenInfo(String token, Date expiryDate) {
    }
}