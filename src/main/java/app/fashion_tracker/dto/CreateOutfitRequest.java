package app.fashion_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateOutfitRequest {

    @NotBlank(message = "Outfit name is required")
    @Size(max = 100, message = "Outfit name must not exceed 100 characters")
    private String name;

    private List<Long> clothingItemIds;

    public CreateOutfitRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Long> getClothingItemIds() {
        return clothingItemIds;
    }

    public void setClothingItemIds(List<Long> clothingItemIds) {
        this.clothingItemIds = clothingItemIds;
    }
}