package app.fashion_tracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    private static final String EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final String serviceId;
    private final String templateId;
    private final String publicKey;
    private final String privateKey;
    private final String frontendUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public EmailService(
            @Value("${app.emailjs.service-id}") String serviceId,
            @Value("${app.emailjs.template-id}") String templateId,
            @Value("${app.emailjs.public-key}") String publicKey,
            @Value("${app.emailjs.private-key}") String privateKey,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.serviceId = serviceId;
        this.templateId = templateId;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.frontendUrl = frontendUrl;
        this.objectMapper = new ObjectMapper();

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        send(
                toEmail,
                "Verify your Fashion Tracker email",
                "Welcome to Fashion Tracker!\n\n" +
                        "Please verify your email address by clicking the link below:\n\n" +
                        link + "\n\n" +
                        "This link expires in 24 hours. If you didn't create this account, " +
                        "you can safely ignore this email."
        );
    }

    public void sendTwoFactorCode(String toEmail, String code) {
        send(
                toEmail,
                "Your Fashion Tracker login code",
                "Your login code is: " + code + "\n\n" +
                        "This code expires in 10 minutes. If you didn't try to log in, " +
                        "you can safely ignore this email."
        );
    }

    public void sendEmailChangeVerification(String toEmail, String token) {
        String link = frontendUrl + "/confirm-email-change?token=" + token;

        send(
                toEmail,
                "Confirm your new Fashion Tracker email",
                "You requested to change your Fashion Tracker email to this address.\n\n" +
                        "Confirm the change by clicking the link below:\n\n" +
                        link + "\n\n" +
                        "This link expires in 24 hours. If you didn't request this, " +
                        "you can safely ignore this email — your email address won't change."
        );
    }

    private void send(String toEmail, String subject, String message) {
        try {
            Map<String, Object> templateParams = new HashMap<>();
            templateParams.put("to_email", toEmail.trim().toLowerCase());
            templateParams.put("subject", subject);
            templateParams.put("message", message);

            Map<String, Object> body = new HashMap<>();
            body.put("service_id", serviceId);
            body.put("template_id", templateId);
            body.put("user_id", publicKey);
            body.put("accessToken", privateKey);
            body.put("template_params", templateParams);

            String jsonBody = objectMapper.writeValueAsString(body);

            //System.out.println("EmailJS request body: " + jsonBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EMAILJS_API_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "EmailJS API returned " + response.statusCode() + ": " + response.body()
                );
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to send email via EmailJS", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;

        send(
                toEmail,
                "Reset your Fashion Tracker password",
                "We received a request to reset your Fashion Tracker password.\n\n" +
                        "Click the link below to choose a new password:\n\n" +
                        link + "\n\n" +
                        "This link expires in 1 hour. If you didn't request this, " +
                        "you can safely ignore this email — your password won't change."
        );
    }
}