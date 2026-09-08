package app.fashion_tracker.service;

import app.fashion_tracker.dto.OutfitItemRequest;
import app.fashion_tracker.model.ClothingItem;
import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.model.OutfitItem;
import app.fashion_tracker.model.User;
import app.fashion_tracker.repository.ClothingItemRepository;
import app.fashion_tracker.repository.OutfitItemRepository;
import app.fashion_tracker.repository.OutfitRepository;
import app.fashion_tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final OutfitItemRepository outfitItemRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final UserRepository userRepository;

    public OutfitService(
            OutfitRepository outfitRepository,
            OutfitItemRepository outfitItemRepository,
            ClothingItemRepository clothingItemRepository,
            UserRepository userRepository
    ) {
        this.outfitRepository = outfitRepository;
        this.outfitItemRepository = outfitItemRepository;
        this.clothingItemRepository = clothingItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Outfit createOutfit(
            Long userId,
            String name,
            List<OutfitItemRequest> items
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Outfit outfit = new Outfit();
        outfit.setUser(user);
        outfit.setName(name);

        outfit = outfitRepository.save(outfit);

        if (items != null) {
            for (OutfitItemRequest itemRequest : items) {

                Long clothingItemId = itemRequest.getClothingItemId();

                ClothingItem clothingItem = clothingItemRepository
                        .findById(clothingItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Clothing item not found: "
                                                + clothingItemId
                                )
                        );

                // Make sure the clothing item belongs to this user
                if (!clothingItem.getUser().getId().equals(userId)) {
                    throw new RuntimeException(
                            "Clothing item does not belong to this user: "
                                    + clothingItemId
                    );
                }

                OutfitItem outfitItem = new OutfitItem();

                outfitItem.setOutfit(outfit);
                outfitItem.setClothingItem(clothingItem);

                // Default to layer 1 if none was provided
                outfitItem.setLayerOrder(
                        itemRequest.getLayerOrder() != null
                                ? itemRequest.getLayerOrder()
                                : 1
                );

                outfitItemRepository.save(outfitItem);

                outfit.getItems().add(outfitItem);
            }
        }

        return outfit;
    }

    @Transactional(readOnly = true)
    public List<Outfit> getUserOutfits(Long userId) {

        return outfitRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Outfit getOutfit(Long userId, Long outfitId) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        if (!outfit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Outfit does not belong to this user");
        }

        // Load the outfit items while we're inside the transaction
        outfit.getItems().size();

        return outfit;
    }

    @Transactional
    public Outfit updateOutfit(
            Long userId,
            Long outfitId,
            String name,
            List<OutfitItemRequest> items
    ) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        if (!outfit.getUser().getId().equals(userId)) {
            throw new RuntimeException(
                    "Outfit does not belong to this user"
            );
        }

        // Update outfit name
        if (name != null && !name.isBlank()) {
            outfit.setName(name);
        }

        if (items != null) {

            // Store requested clothing item IDs and their layer orders
            java.util.Map<Long, Integer> requestedItems =
                    new java.util.HashMap<>();

            for (OutfitItemRequest itemRequest : items) {

                Long clothingItemId = itemRequest.getClothingItemId();

                Integer layerOrder =
                        itemRequest.getLayerOrder() != null
                                ? itemRequest.getLayerOrder()
                                : 1;

                requestedItems.put(
                        clothingItemId,
                        layerOrder
                );
            }

            // Remove clothing items that are no longer in the outfit
            outfit.getItems().removeIf(outfitItem ->
                    !requestedItems.containsKey(
                            outfitItem.getClothingItem().getId()
                    )
            );

            // Find the clothing items already in this outfit
            java.util.Map<Long, OutfitItem> existingItems =
                    new java.util.HashMap<>();

            for (OutfitItem outfitItem : outfit.getItems()) {

                existingItems.put(
                        outfitItem.getClothingItem().getId(),
                        outfitItem
                );
            }

            // Add new items or update existing layer orders
            for (java.util.Map.Entry<Long, Integer> entry
                    : requestedItems.entrySet()) {

                Long clothingItemId = entry.getKey();
                Integer layerOrder = entry.getValue();

                // Item already exists in outfit
                if (existingItems.containsKey(clothingItemId)) {

                    OutfitItem existingOutfitItem =
                            existingItems.get(clothingItemId);

                    existingOutfitItem.setLayerOrder(layerOrder);

                    continue;
                }

                // Find clothing item
                ClothingItem clothingItem = clothingItemRepository
                        .findById(clothingItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Clothing item not found: "
                                                + clothingItemId
                                )
                        );

                // Make sure it belongs to the logged-in user
                if (!clothingItem.getUser().getId().equals(userId)) {
                    throw new RuntimeException(
                            "Clothing item does not belong to this user: "
                                    + clothingItemId
                    );
                }

                // Create new outfit item
                OutfitItem outfitItem = new OutfitItem();

                outfitItem.setOutfit(outfit);
                outfitItem.setClothingItem(clothingItem);
                outfitItem.setLayerOrder(layerOrder);

                outfit.getItems().add(outfitItem);
            }
        }

        return outfitRepository.save(outfit);
    }

    @Transactional
    public void deleteOutfit(Long userId, Long outfitId) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        if (!outfit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Outfit does not belong to this user");
        }

        outfitRepository.delete(outfit);
    }
}