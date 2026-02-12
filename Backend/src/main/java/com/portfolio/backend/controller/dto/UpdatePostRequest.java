package com.portfolio.backend.controller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO per PUT /api/admin/posts/{id}.
 * Evita il mass assignment: solo slug, status e traduzioni sono accettati.
 */
@Getter
@Setter
public class UpdatePostRequest {

    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\-]*$", message = "Lo slug non deve contenere numeri; solo lettere e trattini.")
    private String slug;

    @NotBlank(message = "Lo status è obbligatorio")
    @Pattern(regexp = "^(?i)(published|draft|archived)$", message = "Status deve essere published, draft o archived")
    @Size(max = 20)
    private String status;

    @Valid
    private List<CreatePostTranslationRequest> translations = new ArrayList<>();
}
