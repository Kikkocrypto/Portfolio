package com.portfolio.backend.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request per richiedere un reset password via email.
 * L'utente fornisce la propria email registrata.
 */
public record PasswordResetRequestDto(
    @NotBlank(message = "Email è obbligatoria")
    @Email(message = "Email deve essere valida")
    String email
) {}
