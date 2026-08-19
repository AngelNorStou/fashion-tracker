package app.fashion_tracker.controller;

import app.fashion_tracker.dto.LoginRequest;
import app.fashion_tracker.dto.LoginResponse;
import app.fashion_tracker.dto.RegisterRequest;
import app.fashion_tracker.dto.UserResponse;
import app.fashion_tracker.model.User;
import app.fashion_tracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        User user = authService.register(request);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        String token = authService.login(request);

        return new LoginResponse(token);
    }
}