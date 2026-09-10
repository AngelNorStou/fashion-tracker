package app.fashion_tracker.controller;

import app.fashion_tracker.dto.*;
import app.fashion_tracker.model.User;
import app.fashion_tracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
                user.getEmail(),
                user.isTwoFactorEnabled(),
                user.getPendingEmail()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthService.LoginResult result = authService.login(request);

        return new LoginResponse(
                result.token(), result.twoFactorRequired(), result.deviceToken()
        );
    }

    @PostMapping("/verify-2fa")
    public LoginResponse verifyTwoFactor(
            @Valid @RequestBody VerifyTwoFactorRequest request
    ) {
        AuthService.LoginResult result = authService.verifyTwoFactorCode(request);

        return new LoginResponse(
                result.token(), result.twoFactorRequired(), result.deviceToken()
        );
    }

    @PostMapping("/resend-2fa")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendTwoFactor(
            @Valid @RequestBody ResendTwoFactorRequest request
    ) {
        authService.resendTwoFactorCode(request.email());
    }

    @GetMapping("/verify-email")
    public Map<String, String> verifyEmail(
            @RequestParam String token
    ) {
        authService.verifyEmail(token);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully.");

        return response;
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.requestPasswordReset(request.email());
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
    }
}