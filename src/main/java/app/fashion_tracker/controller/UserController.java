package app.fashion_tracker.controller;

import app.fashion_tracker.dto.ChangeEmailRequest;
import app.fashion_tracker.dto.ChangePasswordRequest;
import app.fashion_tracker.dto.TwoFactorToggleRequest;
import app.fashion_tracker.dto.UpdateProfileRequest;
import app.fashion_tracker.dto.UserResponse;
import app.fashion_tracker.exception.UserNotFoundException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;

import app.fashion_tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(
            UserRepository userRepository,
            UserService userService)
    {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found")
                );

        return UserResponse.from(user);
    }

    @PatchMapping("/me")
    public UserResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());

        User user = userService.updateProfile(userId, request);

        return UserResponse.from(user);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        userService.deleteAccount(userId);
    }

    @PatchMapping("/me/2fa")
    public UserResponse setTwoFactorEnabled(
            Authentication authentication,
            @RequestBody TwoFactorToggleRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());

        User user = userService.setTwoFactorEnabled(userId, request.enabled());

        return UserResponse.from(user);
    }

    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());

        userService.changePassword(userId, request);
    }

    @PostMapping("/me/email-change")
    public UserResponse requestEmailChange(
            Authentication authentication,
            @Valid @RequestBody ChangeEmailRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());

        User user = userService.requestEmailChange(userId, request);

        return UserResponse.from(user);
    }

    @GetMapping("/confirm-email-change")
    public Map<String, String> confirmEmailChange(
            @RequestParam String token
    ) {
        userService.confirmEmailChange(token);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email updated successfully.");

        return response;
    }
}