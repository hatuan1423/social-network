package com.LinkVerse.profile.dto.request;

import com.LinkVerse.profile.entity.Gender;
import com.LinkVerse.profile.entity.UserStatus;
import com.LinkVerse.profile.validator.DobValidator.DobConstraint;
import com.LinkVerse.profile.validator.GenderValidator.GenderConstraint;
import com.LinkVerse.profile.validator.PhoneValidator.PhoneConstraint;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {
    String userId;

    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    String password;
    String imageUrl;

    String firstName;
    String lastName;

    @GenderConstraint(anyOf = {Gender.MALE, Gender.FEMALE, Gender.OTHER}, message = "INVALID_GENDER")
    Gender gender;

    @PhoneConstraint(message = "Phone number invalid format")
    String phoneNumber;

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "EMAIL_IS_REQUIRED")
    String email;

    UserStatus status = UserStatus.ONLINE;

    @DobConstraint(min = 18, message = "Date of birth invalid format")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "dd/MM/yyyy")
    Date dateOfBirth;

    String city;
}
