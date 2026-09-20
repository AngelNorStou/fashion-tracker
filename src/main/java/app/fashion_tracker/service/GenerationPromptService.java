package app.fashion_tracker.service;

import app.fashion_tracker.model.OutfitGeneration.MannequinGender;
import org.springframework.stereotype.Service;

@Service
public class GenerationPromptService {

    public String buildPrompt(MannequinGender gender, boolean hasBelt, boolean hasShoes) {

        String subject = gender == MannequinGender.FEMALE ? "a woman" : "a man";

        StringBuilder prompt = new StringBuilder();
        prompt.append("Given the top image and the bottom image, create an image of ")
                .append(subject)
                .append(" wearing this outfit. ");

        if (hasBelt) {
            prompt.append("The only belt I should is from the belt image. ");
        } else {
            prompt.append("Ignore any belt or accessories shown on the images. ")
                    .append("Do not add a belt unless it's part of the bottom image. ");
        }

        if (hasShoes) {
            prompt.append("The only shoes worn should be from the shoes image, not any shoes shown in the other images. ");
        } else {
            prompt.append("Ignore any shoes shown in the top or bottom images. ");
        }

        prompt.append("Full body shot, feet visible, standing in a neutral front-facing pose, ")
                .append("plain studio background, consistent even lighting.");

        return prompt.toString();
    }
}