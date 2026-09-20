package app.fashion_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GenerateOutfitRequest(

        @NotBlank(message = "Mannequin gender is required")
        @Pattern(regexp = "MALE|FEMALE", message = "Mannequin gender must be MALE or FEMALE")
        String mannequinGender
) {
}