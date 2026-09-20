package app.fashion_tracker.service;

import app.fashion_tracker.dto.OutfitGenerationResponse;
import app.fashion_tracker.dto.OutfitOptionResponse;
import app.fashion_tracker.exception.TooManyRequestsException;
import app.fashion_tracker.model.ClothingItem;
import app.fashion_tracker.model.Outfit;
import app.fashion_tracker.model.OutfitGeneration;
import app.fashion_tracker.model.OutfitGeneration.MannequinGender;
import app.fashion_tracker.model.OutfitItem;
import app.fashion_tracker.repository.OutfitGenerationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OutfitGenerationService {

    private final OutfitGenerationRepository generationRepository;
    private final GenerationPromptService promptService;
    private final RateLimitService rateLimitService;
    private final SupabaseStorageService supabaseStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    private final String geminiApiKey;
    private final String geminiModel;
    private final String supabaseUrl;

    public OutfitGenerationService(
            OutfitGenerationRepository generationRepository,
            GenerationPromptService promptService,
            RateLimitService rateLimitService,
            SupabaseStorageService supabaseStorageService,
            @Value("${app.generation.gemini-api-key}") String geminiApiKey,
            @Value("${app.generation.gemini-model}") String geminiModel,
            @Value("${supabase.url}") String supabaseUrl
    ) {
        this.generationRepository = generationRepository;
        this.promptService = promptService;
        this.rateLimitService = rateLimitService;
        this.supabaseStorageService = supabaseStorageService;
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
        this.supabaseUrl = supabaseUrl;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public OutfitGenerationResponse generate(
            Long userId,
            Outfit outfit,
            MannequinGender gender
    ) {
        if (!rateLimitService.isAllowed(
                "ai-generation:" + userId,
                5,
                Duration.ofHours(24)
        )) {
            throw new TooManyRequestsException(
                    "You've reached today's AI generation limit. Please try again tomorrow."
            );
        }

        OutfitGeneration generation = new OutfitGeneration();
        generation.setUser(outfit.getUser());
        generation.setOutfit(outfit);
        generation.setMannequinGender(gender);
        generation.setStatus(OutfitGeneration.Status.PENDING);
        generationRepository.save(generation);

        try {
            ResolvedItems items = resolveOutfitImages(outfit);

            boolean hasBelt = items.beltImageUrl() != null;
            boolean hasShoes = items.shoesImageUrl() != null;
            String prompt = promptService.buildPrompt(gender, hasBelt, hasShoes);

            byte[] resultImageBytes = callGeminiGenerate(
                    prompt,
                    items.topImageUrl(),
                    items.bottomImageUrl(),
                    items.beltImageUrl(),
                    items.shoesImageUrl()
            );

            String path = "generated/" + userId + "/" + UUID.randomUUID() + ".png";
            String uploadedPath = supabaseStorageService.uploadGeneratedImage(resultImageBytes, path);

            generation.setStatus(OutfitGeneration.Status.SUCCESS);
            generation.setGeneratedImagePath(uploadedPath);
            generationRepository.save(generation);

            return OutfitGenerationResponse.from(generation);

        } catch (Exception e) {
            generation.setStatus(OutfitGeneration.Status.FAILED);
            generation.setErrorMessage(
                    e.getMessage() != null
                            ? e.getMessage().substring(0, Math.min(e.getMessage().length(), 900))
                            : "Unknown error"
            );
            generationRepository.save(generation);

            return OutfitGenerationResponse.from(generation);
        }
    }

    public List<OutfitGenerationResponse> getHistory(
            Long userId,
            String search,
            String gender,
            Long outfitId,
            LocalDate dateFrom,
            LocalDate dateTo
    ) {
        List<OutfitGeneration> generations = generationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, OutfitGeneration.Status.SUCCESS);

        return generations.stream()
                .filter(g -> search == null || search.isBlank()
                        || g.getOutfit().getName().toLowerCase().contains(search.toLowerCase()))
                .filter(g -> gender == null || gender.isBlank()
                        || g.getMannequinGender().name().equalsIgnoreCase(gender))
                .filter(g -> outfitId == null || g.getOutfit().getId().equals(outfitId))
                .filter(g -> dateFrom == null
                        || !g.getCreatedAt().toLocalDate().isBefore(dateFrom))
                .filter(g -> dateTo == null
                        || !g.getCreatedAt().toLocalDate().isAfter(dateTo))
                .map(OutfitGenerationResponse::from)
                .toList();
    }

    public List<OutfitOptionResponse> getOutfitOptions(Long userId) {
        return generationRepository.findDistinctOutfitsByUserId(userId)
                .stream()
                .map(row -> new OutfitOptionResponse((Long) row[0], (String) row[1]))
                .toList();
    }

    public void deleteGeneration(Long userId, Long generationId) {

        OutfitGeneration generation = generationRepository.findById(generationId)
                .orElseThrow(() -> new IllegalArgumentException("Generation not found"));

        if (!generation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Generation not found");
        }

        if (generation.getGeneratedImagePath() != null) {
            supabaseStorageService.deleteGeneratedImage(generation.getGeneratedImagePath());
        }

        generationRepository.delete(generation);
    }

    private ResolvedItems resolveOutfitImages(Outfit outfit) {

        String topUrl = null;
        String bottomUrl = null;
        String beltUrl = null;
        String shoesUrl = null;
        int topLayer = Integer.MIN_VALUE;
        int bottomLayer = Integer.MIN_VALUE;

        for (OutfitItem item : outfit.getItems()) {
            ClothingItem clothingItem = item.getClothingItem();
            String category = clothingItem.getCategory().getSlug();

            if (isTopZone(category) && item.getLayerOrder() > topLayer) {
                topUrl = imageUrlFor(clothingItem);
                topLayer = item.getLayerOrder();
            } else if (isBottomZone(category) && item.getLayerOrder() > bottomLayer) {
                bottomUrl = imageUrlFor(clothingItem);
                bottomLayer = item.getLayerOrder();
            } else if ("belts".equals(category)) {
                beltUrl = imageUrlFor(clothingItem);
            } else if (isShoeZone(category)) {
                shoesUrl = imageUrlFor(clothingItem);
            }
        }

        if (topUrl == null || bottomUrl == null) {
            throw new IllegalStateException(
                    "This outfit needs both a top and a bottom item to generate an image."
            );
        }

        return new ResolvedItems(topUrl, bottomUrl, beltUrl, shoesUrl);
    }

    private boolean isTopZone(String slug) {
        return "tshirts".equals(slug) || "blouses".equals(slug) || "tank-tops".equals(slug)
                || "sweaters".equals(slug) || "hoodies".equals(slug) || "jackets".equals(slug)
                || "coats".equals(slug) || "blazers".equals(slug) || "vests".equals(slug);
    }

    private boolean isBottomZone(String slug) {
        return "jeans".equals(slug) || "trousers".equals(slug) || "shorts".equals(slug)
                || "skirts".equals(slug) || "leggings".equals(slug) || "joggers".equals(slug);
    }

    private boolean isShoeZone(String slug) {
        return "sneakers".equals(slug) || "boots".equals(slug) || "sandals".equals(slug)
                || "heels".equals(slug) || "flats".equals(slug) || "mules".equals(slug)
                || "wedges".equals(slug);
    }

    private String imageUrlFor(ClothingItem item) {
        return supabaseUrl
                + "/storage/v1/object/public/clothing-images/" + item.getImagePath();
    }

    private byte[] callGeminiGenerate(
            String prompt,
            String topUrl,
            String bottomUrl,
            String beltUrl,
            String shoesUrl
    ) throws IOException, InterruptedException {

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        parts.add(imagePart(topUrl));
        parts.add(imagePart(bottomUrl));

        if (beltUrl != null) {
            parts.add(imagePart(beltUrl));
        }

        if (shoesUrl != null) {
            parts.add(imagePart(shoesUrl));
        }

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", parts))
        );

        String jsonBody = objectMapper.writeValueAsString(body);

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", geminiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(
                request, HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() >= 400) {
            throw new RuntimeException(
                    "Gemini API returned " + response.statusCode() + ": " + response.body()
            );
        }

        return extractImageBytes(response.body());
    }

    private Map<String, Object> imagePart(String imageUrl) throws IOException, InterruptedException {

        HttpRequest imageRequest = HttpRequest.newBuilder()
                .uri(URI.create(imageUrl))
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();

        HttpResponse<byte[]> imageResponse = httpClient.send(
                imageRequest, HttpResponse.BodyHandlers.ofByteArray()
        );

        if (imageResponse.statusCode() >= 400) {
            throw new RuntimeException("Failed to fetch reference image: " + imageUrl);
        }

        String base64 = Base64.getEncoder().encodeToString(imageResponse.body());

        return Map.of(
                "inline_data", Map.of(
                        "mime_type", "image/jpeg",
                        "data", base64
                )
        );
    }

    private byte[] extractImageBytes(String responseBody) throws IOException {

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode partsNode = root
                .path("candidates").path(0)
                .path("content").path("parts");

        for (JsonNode part : partsNode) {
            if (part.has("inlineData") || part.has("inline_data")) {
                JsonNode inlineData = part.has("inlineData")
                        ? part.get("inlineData")
                        : part.get("inline_data");

                String base64Data = inlineData.get("data").asText();
                return Base64.getDecoder().decode(base64Data);
            }
        }

        throw new RuntimeException("Gemini response did not contain a generated image.");
    }

    private record ResolvedItems(
            String topImageUrl,
            String bottomImageUrl,
            String beltImageUrl,
            String shoesImageUrl
    ) {
    }
}