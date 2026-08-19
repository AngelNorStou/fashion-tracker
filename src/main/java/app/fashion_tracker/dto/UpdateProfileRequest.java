package app.fashion_tracker.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @Size(min = 3, max = 30,
                message = "Username must be between 3 and 30 characters")
        String username,

        @Email(message = "Invalid email address")
        String email
) {
}