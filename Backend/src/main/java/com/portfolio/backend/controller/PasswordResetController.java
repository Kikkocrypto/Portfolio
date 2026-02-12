package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.ApiError;
import com.portfolio.backend.controller.dto.PasswordResetConfirmDto;
import com.portfolio.backend.controller.dto.PasswordResetRequestDto;
import com.portfolio.backend.controller.dto.PasswordResetResponseDto;
import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

/**
 * Controller per la gestione del reset password admin.
 * 
 * Endpoints:
 * 1. POST /api/admin/auth/password-reset-email - Richiede reset via email
 * 2. POST /api/admin/auth/password-reset - Conferma reset con token
 * 
 * Sicurezza:
 * - Rate limiting configurato (vedi PasswordResetRateLimitConfig)
 * - Risponde sempre con successo per non rivelare info sensibili
 * - Logging sicuro (no password in chiaro)
 * - Validazione input rigorosa
 * - Token one-time use e scadenza
 * - Logout globale dopo reset
 */
@RestController
@RequestMapping("/api/admin/auth")
public class PasswordResetController {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetController.class);

    private static final String PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED";
    private static final String PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS";
    private static final String PASSWORD_RESET_FAILURE = "PASSWORD_RESET_FAILURE";

    private final PasswordResetService passwordResetService;
    private final AuditLogService auditLogService;

    public PasswordResetController(
            PasswordResetService passwordResetService,
            AuditLogService auditLogService) {
        this.passwordResetService = passwordResetService;
        this.auditLogService = auditLogService;
    }

    /**
     * Endpoint 1: Richiesta reset password via email.
     * 
     * SICUREZZA: Risponde sempre con successo per non rivelare se l'email esiste.
     * Token generato solo se email registrata, ma risposta identica.
     * 
     * @param request DTO con email
     * @param bindingResult errori di validazione
     * @param httpRequest request HTTP per audit log (IP, user-agent)
     * @return sempre 200 OK con messaggio generico
     */
    @PostMapping("/password-reset-email")
    public ResponseEntity<?> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request,
            BindingResult bindingResult,
            HttpServletRequest httpRequest) {

        // Validazione input
        if (bindingResult.hasErrors()) {
            ApiError error = buildValidationError(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String ip = resolveIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // Processa richiesta (sempre successo per sicurezza)
        passwordResetService.requestPasswordReset(request.email());

        // Audit log (email mascherata)
        auditLogService.log(
                maskEmail(request.email()), 
                PASSWORD_RESET_REQUESTED, 
                null, null, null, 
                ip, userAgent
        );

        // SICUREZZA: Messaggio generico che non rivela se email esiste
        return ResponseEntity.ok(new PasswordResetResponseDto(
                true,
                "Se l'email è registrata, riceverai un link per il reset della password."
        ));
    }

    /**
     * Endpoint 2: Conferma reset password con token e nuova password.
     * 
     * Validazioni:
     * - Token valido e non scaduto
     * - Password forte (min 8 char, lettere + numeri + simboli)
     * 
     * Operazioni:
     * - Aggiorna password
     * - Invalida token (one-time use)
     * - Revoca tutti i JWT precedenti (logout globale)
     * 
     * @param request DTO con token e nuova password
     * @param bindingResult errori di validazione
     * @param httpRequest request HTTP per audit log
     * @return 200 OK se successo, 400 BAD REQUEST se token invalido
     */
    @PostMapping("/password-reset")
    public ResponseEntity<?> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmDto request,
            BindingResult bindingResult,
            HttpServletRequest httpRequest) {

        // Validazione input
        if (bindingResult.hasErrors()) {
            ApiError error = buildValidationError(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String ip = resolveIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // Tenta reset password
        boolean success = passwordResetService.resetPassword(
                request.token(), 
                request.newPassword()
        );

        if (success) {
            // Audit log successo (username recuperato internamente nel service)
            auditLogService.log(
                    "admin", 
                    PASSWORD_RESET_SUCCESS, 
                    null, null, null, 
                    ip, userAgent
            );

            return ResponseEntity.ok(new PasswordResetResponseDto(
                    true,
                    "Password aggiornata con successo. Tutti i dispositivi sono stati disconnessi."
            ));
        } else {
            // Audit log fallimento
            auditLogService.log(
                    "unknown", 
                    PASSWORD_RESET_FAILURE, 
                    null, null, null, 
                    ip, userAgent
            );

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new ApiError(400, "Token non valido, scaduto o già utilizzato.")
            );
        }
    }

    /**
     * Costruisce ApiError da errori di validazione.
     */
    private ApiError buildValidationError(BindingResult bindingResult) {
        var errors = bindingResult.getFieldErrors().stream()
                .map(err -> new ApiError.FieldError(err.getField(), err.getDefaultMessage()))
                .toList();
        return new ApiError(400, errors);
    }

    /**
     * Risolve IP reale considerando proxy (X-Forwarded-For).
     */
    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : null;
    }

    /**
     * Maschera email per log sicuro.
     */
    private String maskEmail(String email) {
        if (email == null || email.length() < 3) {
            return "***";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }
        String prefix = email.substring(0, Math.min(2, atIndex));
        String domain = email.substring(atIndex);
        return prefix + "***" + domain;
    }
}
