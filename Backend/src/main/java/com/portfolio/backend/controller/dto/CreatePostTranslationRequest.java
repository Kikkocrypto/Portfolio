package com.portfolio.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO per una singola traduzione in creazione/aggiornamento post.
 */
@Getter
@Setter
public class CreatePostTranslationRequest {

    @NotBlank(message = "Il locale è obbligatorio")
    @Pattern(regexp = "^(en|it|es|de|fr)$", message = "Locale deve essere en, it, es, de o fr")
    @Size(max = 5)
    private String locale;

    /** Opzionale: se assente viene generato automaticamente dal titolo (es. "La vittoria" → "la-vittoria"). */
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\-]*$", message = "Lo slug non deve contenere numeri; solo lettere e trattini.")
    private String slug;

    @NotBlank(message = "Il titolo è obbligatorio")
    @Size(max = 500)
    private String title;

    @NotBlank(message = "Il contenuto è obbligatorio")
    @Size(max = 100_000)
    private String content;
}
