package com.portfolio.backend.scheduler;

import com.portfolio.backend.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job schedulato per la pulizia periodica dei token di reset password scaduti.
 * 
 * Esegue la pulizia secondo il cron configurato in application.yml:
 * app.password-reset.cleanup-cron (default: ogni giorno alle 3:00 AM).
 * 
 * Può essere disabilitato impostando la property a "-" (dash).
 */
@Component
public class PasswordResetCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetCleanupJob.class);

    private final PasswordResetService passwordResetService;

    public PasswordResetCleanupJob(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    /**
     * Pulizia periodica dei token scaduti.
     * Cron configurabile da application.yml: app.password-reset.cleanup-cron
     */
    @Scheduled(cron = "${app.password-reset.cleanup-cron:0 0 3 * * ?}")
    public void cleanupExpiredTokens() {
        log.info("Avvio pulizia token di reset password scaduti...");
        try {
            passwordResetService.cleanupExpiredTokens();
            log.info("Pulizia token scaduti completata con successo.");
        } catch (Exception e) {
            log.error("Errore durante la pulizia dei token scaduti", e);
        }
    }
}
