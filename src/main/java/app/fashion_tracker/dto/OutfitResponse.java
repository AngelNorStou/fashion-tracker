package app.fashion_tracker.dto;

import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.model.OutfitItem;

import java.time.LocalDateTime;
import java.util.List;

public class OutfitResponse {

    private Long id;
    private String name;
    private List<Long> clothingItemIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OutfitResponse() {
    }

    public OutfitResponse(
            Long id,
            String name,
            List<Long> clothingItemIds,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.clothingItemIds = clothingItemIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static OutfitResponse fromEntity(Outfit outfit) {

        List<Long> clothingItemIds = outfit.getItems()
                .stream()
                .map(OutfitItem::getClothingItem)
                .map(clothingItem -> clothingItem.getId())
                .toList();

        return new OutfitResponse(
                outfit.getId(),
                outfit.getName(),
                clothingItemIds,
                outfit.getCreatedAt(),
                outfit.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Long> getClothingItemIds() {
        return clothingItemIds;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}