package com.portfolio.backend.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO per l'invio del form contatti.
 */
@Getter
@Setter
public class ContactRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Inserire un indirizzo email valido")
    @Pattern(regexp = "^.+@.+\\..+$", message = "L'email deve contenere un dominio valido con punto (es. nome@dominio.com)")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Il messaggio è obbligatorio")
    @Size(max = 10000)
    private String message;

    /**
     * Honeypot: lasciare vuoto nel form (campo nascosto). Se valorizzato = bot → non salvare.
     */
    private String website;

    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_EMAIL_LENGTH = 255;
    private static final int MAX_MESSAGE_LENGTH = 10000;

    /**
     * Normalizza i campi di input:
     * - name: trim spazi, capitalizza solo la prima lettera (resto minuscolo), tronca a 255 caratteri
     * - email: trim spazi, tronca a 255 caratteri
     * - message: trim spazi, tronca a 10000 caratteri
     * - website: trim spazi
     * Troncamento difensivo: anche se la validazione (@Size) fosse bypassata, non si persiste mai oltre il limite.
     */
    public void normalize() {
        if (name != null) {
            String trimmed = name.trim();
            if (trimmed.length() > MAX_NAME_LENGTH) {
                trimmed = trimmed.substring(0, MAX_NAME_LENGTH);
            }
            if (!trimmed.isEmpty()) {
                String lower = trimmed.toLowerCase();
                this.name = Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
            } else {
                this.name = trimmed;
            }
        }
        if (email != null) {
            String trimmed = email.trim();
            this.email = trimmed.length() > MAX_EMAIL_LENGTH ? trimmed.substring(0, MAX_EMAIL_LENGTH) : trimmed;
        }
        if (message != null) {
            String trimmed = message.trim();
            this.message = trimmed.length() > MAX_MESSAGE_LENGTH ? trimmed.substring(0, MAX_MESSAGE_LENGTH) : trimmed;
        }
        if (website != null) {
            this.website = website.trim();
        }
    }
}
