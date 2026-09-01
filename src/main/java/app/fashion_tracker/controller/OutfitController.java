package app.fashion_tracker.controller;

import app.fashion_tracker.dto.CreateOutfitRequest;
import app.fashion_tracker.dto.OutfitResponse;
import app.fashion_tracker.dto.UpdateOutfitRequest;
import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.service.OutfitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outfits")
public class OutfitController {

    private final OutfitService outfitService;

    public OutfitController(OutfitService outfitService) {
        this.outfitService = outfitService;
    }

    // Create an outfit
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OutfitResponse createOutfit(
            Authentication authentication,
            @Valid @RequestBody CreateOutfitRequest request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        Outfit outfit = outfitService.createOutfit(
                userId,
                request.getName(),
                request.getClothingItemIds()
        );

        return OutfitResponse.fromEntity(outfit);
    }

    // Get all outfits belonging to the logged-in user
    @GetMapping
    public List<OutfitResponse> getUserOutfits(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return outfitService.getUserOutfits(userId)
                .stream()
                .map(OutfitResponse::fromEntity)
                .toList();
    }

    // Get one outfit
    @GetMapping("/{id}")
    public OutfitResponse getOutfit(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        Outfit outfit = outfitService.getOutfit(userId, id);

        return OutfitResponse.fromEntity(outfit);
    }

    // Update an outfit
    @PatchMapping("/{id}")
    public OutfitResponse updateOutfit(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOutfitRequest request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        Outfit outfit = outfitService.updateOutfit(
                userId,
                id,
                request.getName(),
                request.getClothingItemIds()
        );

        return OutfitResponse.fromEntity(outfit);
    }

    // Delete an outfit
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutfit(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        outfitService.deleteOutfit(userId, id);
    }
}