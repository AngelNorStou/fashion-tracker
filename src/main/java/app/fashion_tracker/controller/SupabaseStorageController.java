package app.fashion_tracker.controller;


import app.fashion_tracker.service.SupabaseStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/storage")
public class SupabaseStorageController {

    private final SupabaseStorageService supabaseStorageService;

    public SupabaseStorageController(SupabaseStorageService supabaseStorageService) {
        this.supabaseStorageService = supabaseStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String filePath = "test/" + file.getOriginalFilename();

        String uploadedPath =
                supabaseStorageService.uploadImage(file, filePath);

        return ResponseEntity.ok(uploadedPath);
    }
}