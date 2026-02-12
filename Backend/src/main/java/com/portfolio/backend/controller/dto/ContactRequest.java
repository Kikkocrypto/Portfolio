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

    /**
     * Normalizza i campi di input:
     * - name: trim spazi e capitalizza solo la prima lettera (resto minuscolo)
     * - email: trim spazi iniziali/finali
     * - message/website: trim spazi (per coerenza)
     */
    public void normalize() {
        if (name != null) {
            String trimmed = name.trim();
            if (!trimmed.isEmpty()) {
                String lower = trimmed.toLowerCase();
                this.name = Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
            } else {
                this.name = trimmed;
            }
        }
        if (email != null) {
            this.email = email.trim();
        }
        if (message != null) {
            this.message = message.trim();
        }
        if (website != null) {
            this.website = website.trim();
        }
    }
}
