package app.fashion_tracker.dto;

import app.fashion_tracker.model.OutfitGeneration;

import java.time.LocalDateTime;

public record OutfitGenerationResponse(
        Long id,
        Long outfitId,
        String outfitName,
        String mannequinGender,
        String status,
        String generatedImagePath,
        String errorMessage,
        LocalDateTime createdAt
) {

    public static OutfitGenerationResponse from(OutfitGeneration generation) {
        return new OutfitGenerationResponse(
                generation.getId(),
                generation.getOutfit().getId(),
                generation.getOutfit().getName(),
                generation.getMannequinGender().name(),
                generation.getStatus().name(),
                generation.getGeneratedImagePath(),
                generation.getErrorMessage(),
                generation.getCreatedAt()
        );
    }
}