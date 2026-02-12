package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Risposta di errore: solo codice e dettagli.
 * <p>
 * Esempio semplice: { "status": 409, "details": "Slug già in uso" }
 * Esempio validazione: { "status": 400, "details": [ { "field": "email", "message": "..." } ] }
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ApiError {

    private int status;
    /** Messaggio (errore semplice) oppure lista di errori per campo (validazione). */
    private Object details;

    public ApiError(int status, String details) {
        this.status = status;
        this.details = details;
    }

    public ApiError(int status, List<FieldError> details) {
        this.status = status;
        this.details = details != null ? details : new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class FieldError {
        private String field;
        private String message;

        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }
    }
}
