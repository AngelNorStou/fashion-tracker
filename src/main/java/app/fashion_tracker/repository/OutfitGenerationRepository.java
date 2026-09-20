package app.fashion_tracker.repository;

import app.fashion_tracker.model.OutfitGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OutfitGenerationRepository extends JpaRepository<OutfitGeneration, Long> {

    List<OutfitGeneration> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OutfitGeneration> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, OutfitGeneration.Status status
    );

    @Query("select distinct g.outfit.id, g.outfit.name from OutfitGeneration g " +
            "where g.user.id = :userId and g.status = 'SUCCESS' " +
            "order by g.outfit.name")
    List<Object[]> findDistinctOutfitsByUserId(@Param("userId") Long userId);
}