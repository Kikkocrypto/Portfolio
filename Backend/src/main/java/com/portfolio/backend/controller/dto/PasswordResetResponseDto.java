package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Risposta generica per operazioni di reset password.
 * Non espone informazioni sensibili (es. se l'email esiste o no).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PasswordResetResponseDto(
    boolean success,
    String message
) {}
