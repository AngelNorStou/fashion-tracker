package app.fashion_tracker.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class SupabaseStorageService {

    private final RestClient restClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private static final String BUCKET = "clothing-images";

    public SupabaseStorageService() {
        this.restClient = RestClient.builder().build();
    }

    public String uploadImage(MultipartFile file, String filePath) throws IOException {

        String url = supabaseUrl
                + "/storage/v1/object/"
                + BUCKET
                + "/"
                + filePath;

        restClient.post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .contentType(
                        file.getContentType() != null
                                ? MediaType.parseMediaType(file.getContentType())
                                : MediaType.APPLICATION_OCTET_STREAM
                )
                .body(file.getBytes())
                .retrieve()
                .toBodilessEntity();

        return filePath;
    }
}