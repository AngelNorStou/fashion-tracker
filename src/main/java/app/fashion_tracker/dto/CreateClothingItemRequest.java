package app.fashion_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import app.fashion_tracker.model.Gender;

import java.util.Set;

public record CreateClothingItemRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 100)
        String brand,

        @Size(max = 50)
        String color,

        @Size(max = 30)
        String size,

        Gender gender,

        @NotNull
        Long categoryId,

        Set<Long> tagIds

) {
}