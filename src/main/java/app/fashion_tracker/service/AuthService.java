package app.fashion_tracker.service;

import app.fashion_tracker.dto.LoginRequest;
import app.fashion_tracker.dto.RegisterRequest;
import app.fashion_tracker.dto.VerifyTwoFactorRequest;
import app.fashion_tracker.exception.EmailNotVerifiedException;
import app.fashion_tracker.exception.InvalidCredentialsException;
import app.fashion_tracker.exception.InvalidEmailDomainException;
import app.fashion_tracker.exception.InvalidOrExpiredTokenException;
import app.fashion_tracker.exception.InvalidTwoFactorCodeException;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;
import app.fashion_tracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import app.fashion_tracker.exception.TooManyRequestsException;
import java.time.Duration;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DomainValidationService domainValidationService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final RateLimitService rateLimitService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            DomainValidationService domainValidationService,
            EmailService emailService,
            RateLimitService rateLimitService
    ) {
        this.userRepository = userRepository;
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
                sendTwoFactorCodeToUser(user);
                return new LoginResult(null, true);
            }

            return new LoginResult(jwtService.generateToken(user), false);
        }

    public String verifyTwoFactorCode(VerifyTwoFactorRequest request) {

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

        return jwtService.generateToken(user);
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

    private String generateUrlSafeToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateSixDigitCode() {
        int code = secureRandom.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    private void sendTwoFactorCodeToUser(User user) {
        String code = generateSixDigitCode();

        user.setTwoFactorCode(code);
        user.setTwoFactorCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        emailService.sendTwoFactorCode(user.getEmail(), code);
    }

    public record LoginResult(String token, boolean twoFactorRequired) {
    }
}