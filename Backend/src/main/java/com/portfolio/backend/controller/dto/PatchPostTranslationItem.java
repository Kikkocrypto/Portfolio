package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO per una singola traduzione in PATCH post.
 * In PATCH si possono solo modificare traduzioni esistenti: {@code id} è obbligatorio.
 */
@Getter
@Setter
public class PatchPostTranslationItem {

    /** Obbligatorio: id della traduzione da aggiornare (deve appartenere al post). Il locale non è modificabile. */
    @JsonProperty("id")
    private String id;

    /** Opzionale: se assente viene generato dal titolo. */
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
