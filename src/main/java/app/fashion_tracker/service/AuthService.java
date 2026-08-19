package app.fashion_tracker.service;


import app.fashion_tracker.dto.LoginRequest;
import app.fashion_tracker.dto.RegisterRequest;
import app.fashion_tracker.exception.InvalidCredentialsException;
import app.fashion_tracker.exception.ResourceConflictException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;
import app.fashion_tracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceConflictException("Email is already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new ResourceConflictException("Username is already in use");
        }

        User user = new User();

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        return userRepository.save(user);
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        return jwtService.generateToken(user);
    }
}
