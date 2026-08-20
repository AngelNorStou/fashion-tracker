package app.fashion_tracker.repository;

import app.fashion_tracker.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByUserId(Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}