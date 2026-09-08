package app.fashion_tracker.dto;

import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.model.OutfitItem;

import java.time.LocalDateTime;
import java.util.List;

public class OutfitResponse {

    private Long id;
    private String name;
    private List<OutfitItemRequest> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OutfitResponse() {
    }

    public OutfitResponse(
            Long id,
            String name,
            List<OutfitItemRequest> items,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static OutfitResponse fromEntity(Outfit outfit) {

        List<OutfitItemRequest> items = outfit.getItems()
                .stream()
                .map(outfitItem -> {
                    OutfitItemRequest item = new OutfitItemRequest();

                    item.setClothingItemId(
                            outfitItem.getClothingItem().getId()
                    );

                    item.setLayerOrder(
                            outfitItem.getLayerOrder()
                    );

                    return item;
                })
                .toList();

        return new OutfitResponse(
                outfit.getId(),
                outfit.getName(),
                items,
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

    public List<OutfitItemRequest> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}