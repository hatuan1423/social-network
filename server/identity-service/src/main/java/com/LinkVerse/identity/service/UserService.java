package com.LinkVerse.identity.service;

import com.LinkVerse.event.dto.NotificationEvent;
import com.LinkVerse.identity.constant.PredefinedRole;
import com.LinkVerse.identity.dto.request.UserCreationRequest;
import com.LinkVerse.identity.dto.request.UserUpdateRequest;
import com.LinkVerse.identity.dto.request.UserUpdateRequestAdmin;
import com.LinkVerse.identity.dto.response.UserResponse;
import com.LinkVerse.identity.entity.Role;
import com.LinkVerse.identity.entity.User;
import com.LinkVerse.identity.entity.UserStatus;
import com.LinkVerse.identity.exception.AppException;
import com.LinkVerse.identity.exception.ErrorCode;
import com.LinkVerse.identity.mapper.ProfileMapper;
import com.LinkVerse.identity.mapper.UserMapper;
import com.LinkVerse.identity.repository.RoleRepository;
import com.LinkVerse.identity.repository.UserRepository;
import com.LinkVerse.identity.repository.httpclient.ProfileClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;
    NotificationService notificationService;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");

    public void updateImage(String userId, String imageUrl) {
        User user = userRepository.findUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        user.setImageUrl(imageUrl);
        userRepository.save(user);
    }


    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEmailVerified(false);

        if (request.getStatus() == null) {
            user.setStatus(UserStatus.ONLINE); // Giá trị mặc định
        } else {
            user.setStatus(request.getStatus());
        }
        user.setGender(request.getGender());
        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Tạo hồ sơ người dùng qua profile-service
        var profileRequest = profileMapper.toProfileCreationRequest(request);
        profileRequest.setUserId(user.getId());

        var profile = profileClient.createProfile(profileRequest);

        user.setProfileId(profile.getResult().getId());
        user = userRepository.save(user);

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .recipient(request.getEmail())
                .subject("Welcome to LinkVerse")
                .body("Hello, " + request.getUsername())
                .build();

        // Publish message to kafka
        kafkaTemplate.send("notification-delivery", notificationEvent);


        List<String> userTokens = getAllUserTokensExcept(user);
        notificationService.sendNotificationToUsers(userTokens, "New User Registered", "A new user has joined: " + user.getUsername());


        return userMapper.toUserResponse(user);
    }

    private List<String> getAllUserTokensExcept(User newUser) {
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(newUser.getId()))
                .map(User::getFcmToken)
                .collect(Collectors.toList());
    }

    public UserResponse updateStatus(String userId, String status) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setStatus(UserStatus.valueOf(status));
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        if (context == null || context.getAuthentication() == null) {
            log.error("Security context or authentication is null");
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String name = context.getAuthentication().getName();
        log.info("Authenticated user: {}", name);

        User user = userRepository.findByUsername(name).orElseThrow(() -> {
            log.error("User not found: {}", name);
            return new AppException(ErrorCode.USER_NOT_EXISTED);
        });

        return userMapper.toUserResponse(user);
    }


    public UserResponse updateUser(String userId, UserUpdateRequestAdmin request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserbyUsers(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
                throw new AppException(ErrorCode.INVALID_EMAIL);
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            if (!PHONE_PATTERN.matcher(request.getPhoneNumber()).matches()) {
                throw new AppException(ErrorCode.INVALID_PHONE_NUMBER);
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        user.setBio(request.getBio());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // xoá tạm thời sau 30 ngày nếu không đăng nhập -> xoá vĩnh viễn
    public void deleteUser(String password) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = authentication.getName();

        User user = userRepository.findUserById(userID);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        boolean authenticated = passwordEncoder.matches(password, user.getPassword());
        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        user.setDeletedAt(LocalDateTime.now()); // đã có service xử lý xoá vĩnh viễn sau 30 ngày
        // nếu login lại trước 30 ngày thì xoá deletedAt -> authentication service
        userRepository.save(user);
    }

    // xoá vĩnh viễn trong vòng 30 ngày
    public void deleteUserPermanent(String password) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userID = authentication.getName();

        User user = userRepository.findUserById(userID);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        boolean authenticated = passwordEncoder.matches(password, user.getPassword());
        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (user.getDeletedAt() != null) {
            try {
                profileClient.deleteUserProfile(user.getId()); // xoá profile
            } catch (FeignException e) {
                log.error("Failed to delete user profile for user ID: {}", userID, e);
                throw new AppException(ErrorCode.PROFILE_DELETION_FAILED);
            }
            userRepository.delete(user);
            throw new AppException(ErrorCode.USER_DELETED);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserByAdmin(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        try {
            profileClient.deleteUserProfile(user.getId());
        } catch (FeignException e) {
            log.error("Failed to delete user profile for user ID: {}", userId, e);
            throw new AppException(ErrorCode.PROFILE_DELETION_FAILED);
        }
        userRepository.delete(user);
    }

    public Page<UserResponse> getUsers(int page, int size) {
        log.info("In method get Users");
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);
        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(userMapper::toUserResponse)
                .toList();
        return new PageImpl<>(userResponses, pageable, userPage.getTotalElements());
    }

    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
}
