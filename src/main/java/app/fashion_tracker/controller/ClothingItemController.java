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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/clothing")
public class ClothingItemController {

    private final ClothingItemService clothingItemService;

    public ClothingItemController(
            ClothingItemService clothingItemService
    ) {
        this.clothingItemService = clothingItemService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ClothingItemResponse create(
            Authentication authentication,

            @RequestPart("data")
            @Valid CreateClothingItemRequest request,

            @RequestPart(value = "file", required = false)
            MultipartFile file
    ) throws IOException {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.create(
                userId,
                request,
                file
        );
    }

    @GetMapping
    public List<ClothingItemResponse> getAll(
            Authentication authentication,

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            String color,

            @RequestParam(required = false)
            String brand,

            @RequestParam(required = false)
            String size,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            Long tagId
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.getAll(
                userId,
                search,
                color,
                brand,
                size,
                categoryId,
                tagId
        );
    }

    @GetMapping("/{id}")
    public ClothingItemResponse getById(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.getById(userId, id);
    }



    @PatchMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ClothingItemResponse update(
            Authentication authentication,
            @PathVariable Long id,

            @RequestPart("data")
            @Valid UpdateClothingItemRequest request,

            @RequestPart(value = "file", required = false)
            MultipartFile file
    ) throws IOException {

        Long userId = Long.valueOf(authentication.getName());

        return clothingItemService.update(
                userId,
                id,
                request,
                file
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