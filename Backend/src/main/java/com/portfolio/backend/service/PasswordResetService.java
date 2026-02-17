package com.portfolio.backend.service;

import com.portfolio.backend.entity.AdminUser;
import com.portfolio.backend.entity.PasswordResetToken;
import com.portfolio.backend.repository.AdminUserRepository;
import com.portfolio.backend.repository.PasswordResetTokenRepository;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service per la gestione del reset password.
 * 
 * Funzionalità:
 * - Generazione token di reset temporaneo
 * - Invio email con token (simulato con log)
 * - Validazione e utilizzo token per cambio password
 * - Invalidazione globale JWT tramite tokenVersion increment
 * 
 * Sicurezza:
 * - Token one-time use
 * - Scadenza configurabile
 * - Password hash con BCrypt
 * - Non rivela se email esiste o no
 * - Log sicuro (no password in chiaro)
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Value("${app.password-reset.token-expiration-minutes:60}")
    private int tokenExpirationMinutes;

    @Value("${app.password-reset.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.email-enabled:false}")
    private boolean emailEnabled;

    // EmailService è opzionale (se SMTP non configurato, usa solo log)
    @Autowired(required = false)
    private EmailService emailService;

    public PasswordResetService(
            AdminUserRepository adminUserRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            AuthService authService) {
        this.adminUserRepository = adminUserRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    /**
     * Genera un token di reset e lo "invia" via email.
     * 
     * SICUREZZA: Risponde sempre con successo per non rivelare se l'email esiste.
     * Il token viene generato solo se l'email è registrata.
     * 
     * @param email Email dell'admin
     * @return sempre true (per sicurezza)
     */
    @Transactional
    public boolean requestPasswordReset(String email) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // SICUREZZA: Non rivelare che l'email non esiste
            // Log per debug interno, ma risposta all'utente è identica
            log.info("Password reset richiesto per email non registrata: {}", maskEmail(email));
            return true; // risposta uniforme
        }

        AdminUser user = userOpt.get();
        
        // ID letto direttamente dal DB (evita corruzione UUID/hex con SQLite)
        String adminIdStr = adminUserRepository.findIdByEmailNative(email).orElse(null);
        if (adminIdStr == null || adminIdStr.isBlank()) {
            log.warn("Impossibile leggere id admin per email: {}", maskEmail(email));
            return true; // risposta uniforme
        }

        // Invalida tutti i token precedenti dell'utente
        tokenRepository.invalidateAllTokensForUser(adminIdStr);

        // Genera nuovo token
        String tokenValue = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(tokenExpirationMinutes * 60L);

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(tokenValue);
        token.setAdminUserId(adminIdStr);  // FK da query nativa (stringa raw dal DB)
        token.setExpiresAt(expiry);
        
        tokenRepository.save(token);

        // Invia email se abilitata, altrimenti log
        if (emailEnabled && emailService != null) {
            try {
                String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, tokenValue);
                emailService.sendPasswordResetEmail(user.getEmail(), tokenValue, tokenExpirationMinutes, resetLink);
                log.info("Password reset token generato e email inviata per utente: {} (scade tra {} minuti)", 
                         user.getUsername(), tokenExpirationMinutes);
            } catch (MessagingException e) {
                log.error("Errore invio email reset password per utente: {}", user.getUsername(), e);
            }
        } else {
            log.info("Password reset token generato per utente: {} (scade tra {} minuti)", 
                     user.getUsername(), tokenExpirationMinutes);
        }
        
        return true;
    }

    /**
     * Resetta la password usando il token fornito.
     * 
     * Validazioni:
     * - Token esiste
     * - Non è scaduto
     * - Non è già stato usato
     * - Password forte
     * 
     * Operazioni:
     * - Aggiorna password (hash BCrypt)
     * - Marca token come usato
     * - Invalida tutti i JWT precedenti (logout globale)
     * 
     * @param tokenValue Token di reset
     * @param newPassword Nuova password
     * @return true se successo, false altrimenti
     */
    @Transactional
    public boolean resetPassword(String tokenValue, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(tokenValue);

        if (tokenOpt.isEmpty()) {
            log.warn("Tentativo di reset con token inesistente");
            return false;
        }

        PasswordResetToken token = tokenOpt.get();

        // Verifica validità token
        if (!token.isValid()) {
            log.warn("Tentativo di reset con token invalido o scaduto");
            return false;
        }

        // admin_user_id è una stringa letta dal DB (es. "b1591b93-7deb-420b-a6bf-ce97198c8a9b")
        String adminIdStr = token.getAdminUserId();
        
        if (adminIdStr == null || adminIdStr.isBlank()) {
            log.warn("Token di reset con admin_user_id vuoto");
            return false;
        }

        // Verifica esistenza utente via query nativa (bypassa UUID/entity)
        Optional<String> emailOpt = adminUserRepository.findEmailByIdNative(adminIdStr);
        if (emailOpt.isEmpty()) {
            log.warn("Token di reset riferito a utente admin non più esistente (id non trovato): {}", adminIdStr);
            return false;
        }

        Optional<String> usernameOpt = adminUserRepository.findUsernameByIdNative(adminIdStr);
        String username = usernameOpt.orElse("unknown");
        log.debug("Reset password: admin_user_id={}, username={}", adminIdStr, username);

        // Aggiorna password e invalida JWT con query nativa (nessun load/save entity → nessun id corrotto)
        String hashedPassword = passwordEncoder.encode(newPassword);
        int updated = adminUserRepository.updatePasswordAndRevokeTokensById(adminIdStr, hashedPassword);
        
        if (updated == 0) {
            log.warn("Reset password: update non ha modificato nessuna riga per id={}", adminIdStr);
            return false;
        }

        // Marca token come usato (one-time use)
        token.setUsed(true);
        tokenRepository.save(token);

        log.info("Password resettata con successo per utente: {}. Tutti i JWT precedenti invalidati.", username);
        
        return true;
    }

    /**
     * Pulizia periodica dei token scaduti (opzionale, può essere chiamato da scheduler).
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(Instant.now());
        log.debug("Pulizia token scaduti completata");
    }

    /**
     * Maschera email per log sicuro (mostra solo prime 2 lettere).
     * Es: test@example.com -> te***@example.com
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
