package com.portfolio.backend.config;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Sostituisce il formato predefinito di Spring Boot (timestamp, error, path)
 * con il nostro formato ApiError (solo status + details) per 403, 401 e altri codici.
 */
@Component
public class ApiErrorAttributes extends DefaultErrorAttributes {

    private static final String STATUS = "status";
    private static final String DETAILS = "details";

    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, ErrorAttributeOptions options) {
        Map<String, Object> defaultAttrs = super.getErrorAttributes(webRequest, options);
        Integer status = getStatus(defaultAttrs);
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR.value();
        }

        Map<String, Object> apiError = new LinkedHashMap<>();
        apiError.put(STATUS, status);
        apiError.put(DETAILS, messageForStatus(status, defaultAttrs));
        return apiError;
    }

    private static Integer getStatus(Map<String, Object> defaultAttrs) {
        Object s = defaultAttrs.get("status");
        if (s instanceof Integer) return (Integer) s;
        if (s instanceof Number) return ((Number) s).intValue();
        return null;
    }

    private static String messageForStatus(int status, Map<String, Object> defaultAttrs) {
        return switch (status) {
            case 403 -> "Accesso negato. Non hai i permessi per questa risorsa.";
            case 401 -> "Non autenticato. Token mancante o non valido.";
            case 404 -> "Risorsa non trovata.";
            case 400 -> defaultAttrs.containsKey("message")
                    ? String.valueOf(defaultAttrs.get("message"))
                    : "Richiesta non valida.";
            default -> defaultAttrs.containsKey("message")
                    ? String.valueOf(defaultAttrs.get("message"))
                    : "Si è verificato un errore.";
        };
    }
}
