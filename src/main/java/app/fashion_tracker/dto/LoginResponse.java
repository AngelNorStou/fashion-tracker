package app.fashion_tracker.dto;

public record LoginResponse(
        String token,
        boolean twoFactorRequired
) {
}