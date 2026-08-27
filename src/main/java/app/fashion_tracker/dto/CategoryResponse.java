package app.fashion_tracker.dto;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        Long parentId
) {
}
