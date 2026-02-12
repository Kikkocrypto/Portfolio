package com.portfolio.backend.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request per confermare il reset password con token e nuova password.
 */
public record PasswordResetConfirmDto(
    @NotBlank(message = "Token è obbligatorio")
    String token,

    @NotBlank(message = "Password è obbligatoria")
    @Size(min = 8, message = "La password deve contenere almeno 8 caratteri")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$",
        message = "La password deve contenere almeno una lettera, un numero e un simbolo (es. # . - _ @ $ !)"
    )
    String newPassword
) {}
