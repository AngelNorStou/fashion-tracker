package app.fashion_tracker.dto;

import app.fashion_tracker.model.Gender;

import java.time.LocalDateTime;
import java.util.Set;

public record ClothingItemResponse(

        Long id,
        String name,
        String brand,
        String color,
        String size,
        Gender gender,
        String imagePath,
        Long categoryId,
        String categoryName,
        Set<Long> tagIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}