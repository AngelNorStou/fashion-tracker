package app.fashion_tracker.service;

import app.fashion_tracker.dto.LoginRequest;
import app.fashion_tracker.dto.RegisterRequest;
import app.fashion_tracker.exception.EmailNotVerifiedException;
import app.fashion_tracker.exception.InvalidCredentialsException;
import app.fashion_tracker.exception.InvalidEmailDomainException;
import app.fashion_tracker.exception.InvalidOrExpiredTokenException;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;
import app.fashion_tracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            DomainValidationService domainValidationService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.domainValidationService = domainValidationService;
        this.emailService = emailService;
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
        user.setEmailVerificationToken(generateToken());
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

    public String login(LoginRequest request) {

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

        return jwtService.generateToken(user);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}