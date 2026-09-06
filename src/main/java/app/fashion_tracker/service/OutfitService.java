package app.fashion_tracker.service;

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
    public Outfit createOutfit(Long userId, String name, List<Long> clothingItemIds) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Outfit outfit = new Outfit();
        outfit.setUser(user);
        outfit.setName(name);

        outfit = outfitRepository.save(outfit);

        if (clothingItemIds != null) {
            for (Long clothingItemId : clothingItemIds) {

                ClothingItem clothingItem = clothingItemRepository.findById(clothingItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Clothing item not found: " + clothingItemId
                                )
                        );

                // Make sure the clothing item belongs to this user
                if (!clothingItem.getUser().getId().equals(userId)) {
                    throw new RuntimeException(
                            "Clothing item does not belong to this user: " + clothingItemId
                    );
                }

                OutfitItem outfitItem = new OutfitItem();
                outfitItem.setOutfit(outfit);
                outfitItem.setClothingItem(clothingItem);

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
            List<Long> clothingItemIds
    ) {

        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit not found"));

        if (!outfit.getUser().getId().equals(userId)) {
            throw new RuntimeException("Outfit does not belong to this user");
        }

        if (name != null && !name.isBlank()) {
            outfit.setName(name);
        }

        if (clothingItemIds != null) {

            // Remove duplicates from the request
            java.util.Set<Long> selectedIds = new java.util.HashSet<>(clothingItemIds);

            // Remove items that are no longer selected
            outfit.getItems().removeIf(outfitItem ->
                    !selectedIds.contains(
                            outfitItem.getClothingItem().getId()
                    )
            );

            // IDs of items that are already part of the outfit
            java.util.Set<Long> existingIds = outfit.getItems()
                    .stream()
                    .map(outfitItem -> outfitItem.getClothingItem().getId())
                    .collect(java.util.stream.Collectors.toSet());

            // Add only newly selected items
            for (Long clothingItemId : selectedIds) {

                if (existingIds.contains(clothingItemId)) {
                    continue;
                }

                ClothingItem clothingItem = clothingItemRepository.findById(clothingItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Clothing item not found: " + clothingItemId
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