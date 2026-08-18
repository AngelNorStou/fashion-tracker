package app.fashion_tracker.dto;


import app.fashion_tracker.model.User;

public record UserResponse(
        Long id,
        String username,
        String email
) {}