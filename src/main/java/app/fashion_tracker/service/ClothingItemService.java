package app.fashion_tracker.service;

import app.fashion_tracker.dto.ClothingItemResponse;
import app.fashion_tracker.dto.CreateClothingItemRequest;
import app.fashion_tracker.dto.UpdateClothingItemRequest;
import app.fashion_tracker.exception.InvalidFileException;
import app.fashion_tracker.model.Category;
import app.fashion_tracker.model.ClothingItem;
import app.fashion_tracker.model.Tag;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.*;
import java.util.List;
import java.util.Set;

@Service
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    public ClothingItemService(
            ClothingItemRepository clothingItemRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository,
            UserRepository userRepository,
            SupabaseStorageService supabaseStorageService
    ) {
        this.clothingItemRepository = clothingItemRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    @Transactional
    public ClothingItemResponse create(
            Long userId,
            CreateClothingItemRequest request,
            MultipartFile file
    ) throws IOException {

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
        item.setGender(request.gender());
        item.setTags(tags);

        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("A photo is required to add a clothing item.");
        }


        validateImageFile(file);

        String extension = "";

        if (file.getOriginalFilename() != null &&
                file.getOriginalFilename().contains(".")) {

            extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
        }

        String filePath = userId + "/" + UUID.randomUUID() + extension;

        String imagePath =
                supabaseStorageService.uploadImage(file, filePath);

        item.setImagePath(imagePath);


        ClothingItem saved = clothingItemRepository.save(item);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClothingItemResponse> getAll(
            Long userId,
            String search,
            String color,
            String brand,
            String size,
            Long categoryId,
            Long tagId
    ) {

        return clothingItemRepository.findAll(
                        ClothingItemSpecification.filter(
                                userId,
                                search,
                                color,
                                brand,
                                size,
                                categoryId,
                                tagId
                        )
                )
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
            UpdateClothingItemRequest request,
            MultipartFile file
    )throws IOException
    {

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

        if (request.gender() != null) {
            item.setGender(request.gender());
        }

        if (request.imagePath() != null) {
            item.setImagePath(request.imagePath());
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

        // Upload a new image if one was provided
        if (file != null && !file.isEmpty())
        {
            validateImageFile(file);

            String extension = "";

            if (file.getOriginalFilename() != null &&
                    file.getOriginalFilename().contains(".")) {

                extension = file.getOriginalFilename()
                        .substring(file.getOriginalFilename().lastIndexOf("."));
            }

            String filePath =
                    userId + "/" + UUID.randomUUID() + extension;

            String imagePath =
                    supabaseStorageService.uploadImage(file, filePath);

            item.setImagePath(imagePath);
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
                item.getGender(),
                item.getImagePath(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                tagIds,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    private Category getTopLevelCategory(Category category) {
        Category current = category;

        while (current.getParent() != null) {
            current = current.getParent();
        }

        return current;
    }



    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidFileException("File must be an image.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidFileException("Image must be smaller than 5MB.");
        }
    }
}