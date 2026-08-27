package app.fashion_tracker.dto;

import jakarta.validation.constraints.Size;

import java.util.Set;

public record UpdateClothingItemRequest(

        @Size(max = 100)
        String name,

        @Size(max = 100)
        String brand,

        @Size(max = 50)
        String color,

        @Size(max = 30)
        String size,

        Long categoryId,

        Set<Long> tagIds

) {
}