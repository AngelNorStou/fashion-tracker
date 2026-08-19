package app.fashion_tracker.controller;

import app.fashion_tracker.dto.UpdateProfileRequest;
import app.fashion_tracker.dto.UserResponse;
import app.fashion_tracker.exception.UserNotFoundException;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.UserRepository;

import app.fashion_tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}