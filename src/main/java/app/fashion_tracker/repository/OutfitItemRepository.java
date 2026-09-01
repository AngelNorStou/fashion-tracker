package app.fashion_tracker.repository;


import app.fashion_tracker.model.OutfitItem;
import app.fashion_tracker.model.OutfitItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutfitItemRepository
        extends JpaRepository<OutfitItem, OutfitItemId> {

    List<OutfitItem> findByOutfitId(Long outfitId);

    void deleteByOutfitId(Long outfitId);
}