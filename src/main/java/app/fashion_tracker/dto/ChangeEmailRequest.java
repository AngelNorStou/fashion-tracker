package app.fashion_tracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(

        @NotBlank(message = "New email is required")
        @Email(message = "Invalid email address")
        String newEmail,

        @NotBlank(message = "Current password is required")
        String currentPassword
) {
}