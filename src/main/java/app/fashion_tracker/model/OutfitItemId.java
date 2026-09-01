package app.fashion_tracker.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OutfitItemId implements Serializable {

    private Long outfitId;

    private Long clothingItemId;

    public OutfitItemId() {
    }

    public OutfitItemId(Long outfitId, Long clothingItemId) {
        this.outfitId = outfitId;
        this.clothingItemId = clothingItemId;
    }

    public Long getOutfitId() {
        return outfitId;
    }

    public Long getClothingItemId() {
        return clothingItemId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof OutfitItemId that)) {
            return false;
        }

        return Objects.equals(outfitId, that.outfitId)
                && Objects.equals(clothingItemId, that.clothingItemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(outfitId, clothingItemId);
    }
}