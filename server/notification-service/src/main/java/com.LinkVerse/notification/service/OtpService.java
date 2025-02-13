package com.LinkVerse.notification.service;

import com.LinkVerse.notification.entity.User;
import com.LinkVerse.notification.repository.UserRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.stereotype.Service;

@Service
public class OtpService {
    private final GoogleAuthenticator gAuth;
    private final UserRepository userRepository;
    private final OtpStorageService otpStorageService;

    public OtpService(UserRepository userRepository, OtpStorageService otpStorageService) {
        this.userRepository = userRepository;
        this.otpStorageService = otpStorageService;
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setTimeStepSizeInMillis(30000)
                .setWindowSize(3)
                .build();
        this.gAuth = new GoogleAuthenticator(config);
    }

    public int generateOtp(String email) {
        String secretKey = generateSecretKey();
        int otp = getTotpPassword(secretKey);
        saveOtpSecretKey(email, secretKey);
        otpStorageService.storeOtpForUser(email, otp); // Store OTP in cache
        return otp;
    }

    public void saveOtpSecretKey(String email, String secretKey) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setOtpSecretKey(secretKey);
        userRepository.save(user);
        otpStorageService.storeSecretKeyForUser(email, secretKey); // Store secretKey in cache
    }

    public String generateSecretKey() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public int getTotpPassword(String secretKey) {
        return gAuth.getTotpPassword(secretKey);
    }

    public boolean isOtpValid(User user, int otp) {
        String secretKey = otpStorageService.getSecretKeyForUser(user.getEmail());
        if (secretKey == null) {
            throw new RuntimeException("No OTP secret key for this user");
        }
        return gAuth.authorize(secretKey, otp); // Compare OTP with stored secretKey
    }
}