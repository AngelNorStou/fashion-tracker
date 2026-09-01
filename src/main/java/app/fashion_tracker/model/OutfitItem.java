package app.fashion_tracker.model;


import jakarta.persistence.*;

@Entity
@Table(name = "outfit_items")
public class OutfitItem {

    @EmbeddedId
    private OutfitItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("outfitId")
    @JoinColumn(name = "outfit_id", nullable = false)
    private Outfit outfit;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clothingItemId")
    @JoinColumn(name = "clothing_item_id", nullable = false)
    private ClothingItem clothingItem;

    public OutfitItem() {
    }

    public OutfitItem(Outfit outfit, ClothingItem clothingItem) {
        this.outfit = outfit;
        this.clothingItem = clothingItem;

        this.id = new OutfitItemId(
                outfit.getId(),
                clothingItem.getId()
        );
    }

    public OutfitItemId getId() {
        return id;
    }

    public Outfit getOutfit() {
        return outfit;
    }

    public void setOutfit(Outfit outfit) {
        this.outfit = outfit;
    }

    public ClothingItem getClothingItem() {
        return clothingItem;
    }

    public void setClothingItem(ClothingItem clothingItem) {
        this.clothingItem = clothingItem;
    }
}