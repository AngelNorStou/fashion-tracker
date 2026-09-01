package app.fashion_tracker.repository;

import app.fashion_tracker.model.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutfitRepository extends JpaRepository<Outfit, Long> {

    List<Outfit> findByUserId(Long userId);
}