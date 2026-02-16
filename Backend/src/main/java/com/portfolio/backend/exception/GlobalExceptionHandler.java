package com.portfolio.backend.exception;

import com.portfolio.backend.controller.dto.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Gestisce le eccezioni in modo centralizzato e restituisce errori descrittivi
 * in formato {@link ApiError}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Validazione fallita su @Valid @RequestBody (Bean Validation).
     * Restituisce 400 con l'elenco dei campi e relativi messaggi.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ApiError.FieldError(err.getField(), err.getDefaultMessage() != null ? err.getDefaultMessage() : "Valore non valido"))
                .collect(Collectors.toList());
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
    }

    /**
     * Body JSON mancante, malformato o tipo errato.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "Body JSON non valido o mancante.";
        if (ex.getMessage() != null && ex.getMessage().contains("Required request body")) {
            message = "Il body della richiesta è obbligatorio.";
        }
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
    }

    /**
     * Parametro obbligatorio mancante (query/path).
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex) {
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(),
                "Parametro obbligatorio mancante: " + ex.getParameterName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
    }

    /**
     * Tipo parametro errato (es. UUID non valido nel path).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Valore non valido per il parametro '" + ex.getName() + "': " + (ex.getValue() != null ? ex.getValue() : "null");
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
    }

    /**
     * Risorsa non trovata (404). Messaggio generico per non rivelare l'esistenza della risorsa.
     */
    @ExceptionHandler(MessageNotFoundException.class)
    public ResponseEntity<ApiError> handleMessageNotFound(MessageNotFoundException ex) {
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND.value(), "Risorsa non trovata.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);
    }

    /**
     * Audit log non trovato (404). Messaggio generico per evitare information disclosure.
     */
    @ExceptionHandler(AuditLogNotFoundException.class)
    public ResponseEntity<ApiError> handleAuditLogNotFound(AuditLogNotFoundException ex) {
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND.value(), "Risorsa non trovata.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);
    }

    /**
     * Accesso negato (403): utente autenticato ma senza permesso per la risorsa.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        ApiError apiError = new ApiError(HttpStatus.FORBIDDEN.value(),
                "Accesso negato. Non hai i permessi per questa risorsa.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiError);
    }

    /**
     * Nessun controller ha gestito il path richiesto (Spring Boot 3.2+).
     * Restituisce 404 invece di 500 per evitare log di errore fuorvianti.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResourceFound(NoResourceFoundException ex) {
        log.warn("Richiesta senza handler: {} {}", ex.getHttpMethod(), ex.getResourcePath());
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND.value(),
                "Endpoint o risorsa non trovata.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);
    }

    /**
     * Fallback per altre eccezioni non gestite: 500 con messaggio generico.
     * Logga solo tipo e messaggio (no stack trace) per evitare information disclosure nei log.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        log.error("Errore 500 - eccezione non gestita: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Si è verificato un errore interno. Riprova più tardi.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiError);
    }
}
