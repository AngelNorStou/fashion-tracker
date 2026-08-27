package app.fashion_tracker.controller;

import app.fashion_tracker.dto.ClothingItemResponse;
import app.fashion_tracker.dto.CreateClothingItemRequest;
import app.fashion_tracker.dto.UpdateClothingItemRequest;
import app.fashion_tracker.service.ClothingItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clothing")
public class ClothingItemController {

    private final ClothingItemService clothingItemService;

    public ClothingItemController(
            ClothingItemService clothingItemService
    ) {
        this.clothingItemService = clothingItemService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClothingItemResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateClothingItemRequest request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.create(userId, request);
    }

    @GetMapping
    public List<ClothingItemResponse> getAll(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.getAll(userId);
    }

    @GetMapping("/{id}")
    public ClothingItemResponse getById(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.getById(userId, id);
    }

    @PatchMapping("/{id}")
    public ClothingItemResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateClothingItemRequest request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.update(
                userId,
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        clothingItemService.delete(userId, id);
    }
}