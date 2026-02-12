package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Body per PATCH /api/admin/posts/translations/{translationId}.
 * Modifica title, content e/o slug della singola traduzione.
 */
@Getter
@Setter
public class PatchTranslationRequest {

    /** Opzionale. Se assente viene generato dal titolo. */
    @JsonProperty("slug")
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\-]*$", message = "Lo slug non deve contenere numeri; solo lettere e trattini.")
    private String slug;

    @JsonProperty("title")
    @NotBlank(message = "Il titolo è obbligatorio")
    @Size(max = 500)
    private String title;

    @JsonProperty("content")
    @NotBlank(message = "Il contenuto è obbligatorio")
    @Size(max = 100_000)
    private String content;
}
