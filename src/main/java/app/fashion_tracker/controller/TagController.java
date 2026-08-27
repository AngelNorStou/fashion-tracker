package app.fashion_tracker.controller;

import app.fashion_tracker.dto.CreateTagRequest;
import app.fashion_tracker.dto.TagResponse;
import app.fashion_tracker.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateTagRequest request
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return tagService.create(userId, request);
    }

    @GetMapping
    public List<TagResponse> getAll(
            Authentication authentication
    ) {

        Long userId = Long.valueOf(authentication.getName());

        return tagService.getAll(userId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable Long id
    ) {

        Long userId = Long.valueOf(authentication.getName());

        tagService.delete(userId, id);
    }
}