package app.fashion_tracker.service;

import app.fashion_tracker.dto.LoginRequest;
import app.fashion_tracker.dto.RegisterRequest;
import app.fashion_tracker.dto.ResetPasswordRequest;
import app.fashion_tracker.dto.VerifyTwoFactorRequest;
import app.fashion_tracker.exception.EmailNotVerifiedException;
import app.fashion_tracker.exception.InvalidCredentialsException;
import app.fashion_tracker.exception.InvalidEmailDomainException;
import app.fashion_tracker.exception.InvalidOrExpiredTokenException;
import app.fashion_tracker.exception.InvalidTwoFactorCodeException;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.exception.TooManyRequestsException;
import app.fashion_tracker.model.TrustedDevice;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.TrustedDeviceRepository;
import app.fashion_tracker.repository.UserRepository;
import app.fashion_tracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class AuthService {

    private static final int DEVICE_TRUST_DAYS = 30;

    private final UserRepository userRepository;
    private final TrustedDeviceRepository trustedDeviceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DomainValidationService domainValidationService;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            TrustedDeviceRepository trustedDeviceRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            DomainValidationService domainValidationService,
            EmailService emailService,
            RateLimitService rateLimitService
    ) {
        this.userRepository = userRepository;
        this.trustedDeviceRepository = trustedDeviceRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.domainValidationService = domainValidationService;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceConflictException("Email is already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new ResourceConflictException("Username is already in use");
        }

        if (!domainValidationService.isValidEmailDomain(request.email())) {
            throw new InvalidEmailDomainException(
                    "This email address doesn't appear to be able to receive mail. Please use a real email address."
            );
        }

        User user = new User();

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(false);
        user.setEmailVerificationToken(generateUrlSafeToken());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(24));

        User saved = userRepository.save(user);

        emailService.sendVerificationEmail(
                saved.getEmail(),
                saved.getEmailVerificationToken()
        );

        return saved;
    }

    public void verifyEmail(String token) {

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() ->
                        new InvalidOrExpiredTokenException("Invalid or expired verification link")
                );

        if (user.getEmailVerificationExpiresAt() == null ||
                user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOrExpiredTokenException("Invalid or expired verification link");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);

        userRepository.save(user);
    }

    public LoginResult login(LoginRequest request) {

        if (!rateLimitService.isAllowed(
                "login:" + request.email().toLowerCase(),
                10,
                Duration.ofMinutes(15)
        )) {
            throw new TooManyRequestsException(
                    "Too many login attempts. Please try again later."
            );
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password")
                );

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException(
                    "Please verify your email before logging in. Check your inbox for the verification link."
            );
        }

        if (user.isTwoFactorEnabled()) {
            if (request.deviceToken() != null && isTrustedDevice(user, request.deviceToken())) {
                // Known device within its trust window: skip the 2FA
                // email entirely and issue the session token directly.
                return new LoginResult(jwtService.generateToken(user), false, null);
            }

            sendTwoFactorCodeToUser(user);
            return new LoginResult(null, true, null);
        }

        return new LoginResult(jwtService.generateToken(user), false, null);
    }

    public LoginResult verifyTwoFactorCode(VerifyTwoFactorRequest request) {

        if (!rateLimitService.isAllowed(
                "2fa:" + request.email().toLowerCase(),
                5,
                Duration.ofMinutes(10)
        )) {
            throw new TooManyRequestsException(
                    "Too many attempts. Please request a new code."
            );
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password")
                );

        if (user.getTwoFactorCode() == null ||
                !user.getTwoFactorCode().equals(request.code()) ||
                user.getTwoFactorCodeExpiresAt() == null ||
                user.getTwoFactorCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTwoFactorCodeException("Invalid or expired code");
        }

        user.setTwoFactorCode(null);
        user.setTwoFactorCodeExpiresAt(null);
        userRepository.save(user);

        String deviceToken = issueTrustedDevice(user);

        return new LoginResult(jwtService.generateToken(user), false, deviceToken);
    }

    public void resendTwoFactorCode(String email) {

        if (!rateLimitService.isAllowed(
                "resend2fa:" + email.toLowerCase(),
                3,
                Duration.ofMinutes(15)
        )) {
            throw new TooManyRequestsException(
                    "Too many resend attempts. Please wait before trying again."
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password")
                );

        if (!user.isTwoFactorEnabled()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        sendTwoFactorCodeToUser(user);
    }

    private boolean isTrustedDevice(User user, String rawDeviceToken) {
        String hash = hashToken(rawDeviceToken);

        return trustedDeviceRepository
                .findByUserIdAndDeviceTokenHash(user.getId(), hash)
                .filter(device -> device.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

    private String issueTrustedDevice(User user) {
        String rawToken = generateUrlSafeToken();

        TrustedDevice device = new TrustedDevice();
        device.setUser(user);
        device.setDeviceTokenHash(hashToken(rawToken));
        device.setExpiresAt(LocalDateTime.now().plusDays(DEVICE_TRUST_DAYS));

        trustedDeviceRepository.save(device);

        return rawToken;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private void sendTwoFactorCodeToUser(User user) {
        String code = generateSixDigitCode();

        user.setTwoFactorCode(code);
        user.setTwoFactorCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        emailService.sendTwoFactorCode(user.getEmail(), code);
    }

    private String generateUrlSafeToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateSixDigitCode() {
        int code = secureRandom.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    public record LoginResult(String token, boolean twoFactorRequired, String deviceToken) {
    }

    public void requestPasswordReset(String email) {

        if (!rateLimitService.isAllowed(
                "forgot-password:" + email.toLowerCase(),
                3,
                Duration.ofMinutes(15)
        )) {
            throw new TooManyRequestsException(
                    "Too many requests. Please try again later."
            );
        }

        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPasswordResetToken(generateUrlSafeToken());
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));

            userRepository.save(user);

            emailService.sendPasswordResetEmail(
                    user.getEmail(), user.getPasswordResetToken()
            );
        });

        // Deliberately no branching on whether the user was found -- the
        // caller always gets the same generic response either way, so
        // this endpoint can't be used to discover which emails are
        // registered.
    }

    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByPasswordResetToken(request.token())
                .orElseThrow(() ->
                        new InvalidOrExpiredTokenException("Invalid or expired reset link")
                );

        if (user.getPasswordResetExpiresAt() == null ||
                user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOrExpiredTokenException("Invalid or expired reset link");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);

        userRepository.save(user);

        // A password reset means we can no longer be sure this account
        // wasn't compromised -- revoke every trusted device so 2FA is
        // required again everywhere, closing off any device an attacker
        // might have gotten trusted before the real owner regained
        // control.
        trustedDeviceRepository.deleteAllByUserId(user.getId());
    }
}