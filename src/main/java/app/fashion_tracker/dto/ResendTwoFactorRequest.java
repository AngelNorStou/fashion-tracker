package app.fashion_tracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendTwoFactorRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email
) {
}