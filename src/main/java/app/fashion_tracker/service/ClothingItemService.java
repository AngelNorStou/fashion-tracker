package app.fashion_tracker.service;

import app.fashion_tracker.dto.ClothingItemResponse;
import app.fashion_tracker.dto.CreateClothingItemRequest;
import app.fashion_tracker.dto.UpdateClothingItemRequest;
import app.fashion_tracker.model.Category;
import app.fashion_tracker.model.ClothingItem;
import app.fashion_tracker.model.Tag;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.CategoryRepository;
import app.fashion_tracker.repository.ClothingItemRepository;
import app.fashion_tracker.repository.TagRepository;
import app.fashion_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.List;
import java.util.Set;

@Service
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public ClothingItemService(
            ClothingItemRepository clothingItemRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            UserRepository userRepository
    ) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ClothingItemResponse create(
            Long userId,
            CreateClothingItemRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found")
                );

        Set<Tag> tags = getUserTags(userId, request.tagIds());

        ClothingItem item = new ClothingItem();

        item.setUser(user);
        item.setCategory(category);
        item.setName(request.name());
        item.setBrand(request.brand());
        item.setColor(request.color());
        item.setSize(request.size());
        item.setTags(tags);

        ClothingItem saved = clothingItemRepository.save(item);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClothingItemResponse> getAll(Long userId) {

        return clothingItemRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClothingItemResponse getById(
            Long userId,
            Long itemId
    ) {

        ClothingItem item = getUserItem(userId, itemId);

        return toResponse(item);
    }

    @Transactional
    public ClothingItemResponse update(
            Long userId,
            Long itemId,
            UpdateClothingItemRequest request
    ) {

        ClothingItem item = getUserItem(userId, itemId);

        if (request.name() != null) {
            item.setName(request.name());
        }

        if (request.brand() != null) {
            item.setBrand(request.brand());
        }

        if (request.color() != null) {
            item.setColor(request.color());
        }

        if (request.size() != null) {
            item.setSize(request.size());
        }

        if (request.categoryId() != null) {

            Category category = categoryRepository
                    .findById(request.categoryId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Category not found")
                    );

            item.setCategory(category);
        }

        if (request.tagIds() != null) {
            item.setTags(getUserTags(userId, request.tagIds()));
        }

        return toResponse(item);
    }

    @Transactional
    public void delete(
            Long userId,
            Long itemId
    ) {

        ClothingItem item = getUserItem(userId, itemId);

        clothingItemRepository.delete(item);
    }

    private ClothingItem getUserItem(
            Long userId,
            Long itemId
    ) {

        return clothingItemRepository.findById(itemId)
                .filter(item -> item.getUser().getId().equals(userId))
                .orElseThrow(() ->
                        new IllegalArgumentException("Clothing item not found")
                );
    }

    private Set<Tag> getUserTags(
            Long userId,
            Set<Long> tagIds
    ) {

        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Tag> tags = tagRepository.findAllById(tagIds);

        if (tags.size() != tagIds.size()) {
            throw new IllegalArgumentException("One or more tags not found");
        }

        boolean containsAnotherUsersTag = tags.stream()
                .anyMatch(tag ->
                        !tag.getUser().getId().equals(userId)
                );

        if (containsAnotherUsersTag) {
            throw new IllegalArgumentException(
                    "One or more tags do not belong to the user"
            );
        }

        return new HashSet<>(tags);
    }

    private ClothingItemResponse toResponse(ClothingItem item) {

        Set<Long> tagIds = item.getTags()
                .stream()
                .map(Tag::getId)
                .collect(java.util.stream.Collectors.toSet());

        return new ClothingItemResponse(
                item.getId(),
                item.getName(),
                item.getBrand(),
                item.getColor(),
                item.getSize(),
                item.getImagePath(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                tagIds,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}