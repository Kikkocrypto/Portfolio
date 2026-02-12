package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * Body per PATCH /api/admin/posts/{id}.
 * Modifica solo status e/o slug del post (non le traduzioni).
 */
@Getter
@Setter
public class PatchPostRequest {

    /** Opzionale. Valori: published, draft, archived (case-insensitive). */
    @JsonProperty("status")
    private String status;

    /** Opzionale. Slug del post (solo lettere e trattini, no numeri). */
    @JsonProperty("slug")
    private String slug;
}
