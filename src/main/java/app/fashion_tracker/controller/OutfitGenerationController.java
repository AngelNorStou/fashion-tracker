package app.fashion_tracker.controller;

import app.fashion_tracker.dto.GenerateOutfitRequest;
import app.fashion_tracker.dto.OutfitGenerationResponse;
import app.fashion_tracker.dto.OutfitOptionResponse;
import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.model.OutfitGeneration;
import app.fashion_tracker.service.OutfitGenerationService;
import app.fashion_tracker.service.OutfitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class OutfitGenerationController {

    private final OutfitGenerationService outfitGenerationService;
    private final OutfitService outfitService;

    public OutfitGenerationController(
            OutfitGenerationService outfitGenerationService,
            OutfitService outfitService
    ) {
        this.outfitGenerationService = outfitGenerationService;
        this.outfitService = outfitService;
    }

    @PostMapping("/api/outfits/{outfitId}/generate")
    public OutfitGenerationResponse generate(
            Authentication authentication,
            @PathVariable Long outfitId,
            @Valid @RequestBody GenerateOutfitRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());

        Outfit outfit = outfitService.getOutfit(userId, outfitId);

        OutfitGeneration.MannequinGender gender =
                OutfitGeneration.MannequinGender.valueOf(request.mannequinGender());

        return outfitGenerationService.generate(userId, outfit, gender);
    }

    @GetMapping("/api/generations")
    public List<OutfitGenerationResponse> getHistory(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Long outfitId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        Long userId = Long.valueOf(authentication.getName());

        return outfitGenerationService.getHistory(userId, search, gender, outfitId, dateFrom, dateTo);
    }

    @GetMapping("/api/generations/outfits")
    public List<OutfitOptionResponse> getOutfitOptions(
            Authentication authentication
    ) {
        Long userId = Long.valueOf(authentication.getName());

        return outfitGenerationService.getOutfitOptions(userId);
    }

    @DeleteMapping("/api/generations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGeneration(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = Long.valueOf(authentication.getName());

        outfitGenerationService.deleteGeneration(userId, id);
    }
}