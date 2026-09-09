package app.fashion_tracker.dto;

import app.fashion_tracker.model.User;

public record UserResponse(
        Long id,
        String username,
        String email,
        boolean twoFactorEnabled,
        String pendingEmail
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isTwoFactorEnabled(),
                user.getPendingEmail()
        );
    }
}