package app.fashion_tracker.service;

import app.fashion_tracker.dto.ChangeEmailRequest;
import app.fashion_tracker.dto.ChangePasswordRequest;
import app.fashion_tracker.dto.UpdateProfileRequest;
import app.fashion_tracker.exception.InvalidCredentialsException;
import app.fashion_tracker.exception.InvalidEmailDomainException;
import app.fashion_tracker.exception.InvalidOrExpiredTokenException;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.exception.UserNotFoundException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DomainValidationService domainValidationService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            DomainValidationService domainValidationService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.domainValidationService = domainValidationService;
        this.emailService = emailService;
    }

    public User updateProfile(
            Long userId,
            UpdateProfileRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        if (request.username() != null &&
                !request.username().equals(user.getUsername())) {

            if (userRepository.existsByUsername(request.username())) {
                throw new ResourceConflictException(
                        "Username is already in use"
                );
            }

            user.setUsername(request.username());
        }

        if (request.email() != null &&
                !request.email().equals(user.getEmail())) {

            if (userRepository.existsByEmail(request.email())) {
                throw new ResourceConflictException(
                        "Email is already in use"
                );
            }

            user.setEmail(request.email());
        }

        return userRepository.save(user);
    }

    public void deleteAccount(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        userRepository.delete(user);
    }

    public User setTwoFactorEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        user.setTwoFactorEnabled(enabled);

        if (!enabled) {
            user.setTwoFactorCode(null);
            user.setTwoFactorCodeExpiresAt(null);
        }

        return userRepository.save(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPasswordHash()
        )) {
            throw new ResourceConflictException(
                    "New password must be different from your current password"
            );
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);
    }

    public User requestEmailChange(Long userId, ChangeEmailRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (request.newEmail().equalsIgnoreCase(user.getEmail())) {
            throw new ResourceConflictException(
                    "That's already your current email address"
            );
        }

        if (userRepository.existsByEmail(request.newEmail())) {
            throw new ResourceConflictException("Email is already in use");
        }

        if (!domainValidationService.isValidEmailDomain(request.newEmail())) {
            throw new InvalidEmailDomainException(
                    "This email address doesn't appear to be able to receive mail. Please use a real email address."
            );
        }

        String token = generateUrlSafeToken();

        user.setPendingEmail(request.newEmail());
        user.setEmailChangeToken(token);
        user.setEmailChangeExpiresAt(LocalDateTime.now().plusHours(24));

        User saved = userRepository.save(user);

        emailService.sendEmailChangeVerification(request.newEmail(), token);

        return saved;
    }

    public void confirmEmailChange(String token) {

        User user = userRepository.findByEmailChangeToken(token)
                .orElseThrow(() ->
                        new InvalidOrExpiredTokenException("Invalid or expired confirmation link")
                );

        if (user.getEmailChangeExpiresAt() == null ||
                user.getEmailChangeExpiresAt().isBefore(LocalDateTime.now()) ||
                user.getPendingEmail() == null) {
            throw new InvalidOrExpiredTokenException("Invalid or expired confirmation link");
        }

        // Re-check uniqueness in case someone else claimed this email
        // in the time between the request and the confirmation click.
        if (userRepository.existsByEmail(user.getPendingEmail())) {
            throw new ResourceConflictException("Email is already in use");
        }

        user.setEmail(user.getPendingEmail());
        user.setPendingEmail(null);
        user.setEmailChangeToken(null);
        user.setEmailChangeExpiresAt(null);

        userRepository.save(user);
    }

    private String generateUrlSafeToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}