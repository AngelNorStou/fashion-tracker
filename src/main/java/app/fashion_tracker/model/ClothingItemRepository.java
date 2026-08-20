package app.fashion_tracker.model;

import app.fashion_tracker.model.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {

    List<ClothingItem> findByUserId(Long userId);

    List<ClothingItem> findByUserIdAndCategoryId(
            Long userId,
            Long categoryId
    );
}