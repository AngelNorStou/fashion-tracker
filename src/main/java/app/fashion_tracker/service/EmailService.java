package app.fashion_tracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Verify your Fashion Tracker email");
        message.setText(
                "Welcome to Fashion Tracker!\n\n" +
                        "Please verify your email address by clicking the link below:\n\n" +
                        link + "\n\n" +
                        "This link expires in 24 hours. If you didn't create this account, " +
                        "you can safely ignore this email."
        );

        mailSender.send(message);
    }

    public void sendTwoFactorCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your Fashion Tracker login code");
        message.setText(
                "Your login code is: " + code + "\n\n" +
                        "This code expires in 10 minutes. If you didn't try to log in, " +
                        "you can safely ignore this email."
        );

        mailSender.send(message);
    }

    public void sendEmailChangeVerification(String toEmail, String token) {
        String link = frontendUrl + "/confirm-email-change?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Confirm your new Fashion Tracker email");
        message.setText(
                "You requested to change your Fashion Tracker email to this address.\n\n" +
                        "Confirm the change by clicking the link below:\n\n" +
                        link + "\n\n" +
                        "This link expires in 24 hours. If you didn't request this, " +
                        "you can safely ignore this email — your email address won't change."
        );

        mailSender.send(message);
    }
}