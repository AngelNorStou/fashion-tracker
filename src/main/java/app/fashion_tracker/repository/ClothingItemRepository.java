package app.fashion_tracker.repository;

import app.fashion_tracker.model.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ClothingItemRepository
        extends JpaRepository<ClothingItem, Long>,
        JpaSpecificationExecutor<ClothingItem> {

    List<ClothingItem> findByUserId(Long userId);
}