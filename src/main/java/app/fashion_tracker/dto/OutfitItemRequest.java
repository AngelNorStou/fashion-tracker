package app.fashion_tracker.dto;

public class OutfitItemRequest {

    private Long clothingItemId;
    private Integer layerOrder;

    public OutfitItemRequest() {
    }

    public Long getClothingItemId() {
        return clothingItemId;
    }

    public void setClothingItemId(Long clothingItemId) {
        this.clothingItemId = clothingItemId;
    }

    public Integer getLayerOrder() {
        return layerOrder;
    }

    public void setLayerOrder(Integer layerOrder) {
        this.layerOrder = layerOrder;
    }
}