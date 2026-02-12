package com.portfolio.backend.config;

import com.portfolio.backend.entity.AdminUser;
import com.portfolio.backend.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * All'avvio, se non esiste nessun admin e sono impostate le variabili
 * ADMIN_INIT_USERNAME, ADMIN_INIT_EMAIL, ADMIN_INIT_PASSWORD (es. nel .env),
 * crea il primo utente admin.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    public AdminBootstrap(AdminUserRepository adminUserRepository,
                         PasswordEncoder passwordEncoder,
                         Environment env) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.env = env;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminUserRepository.count() > 0) {
            return;
        }
        String username = env.getProperty("ADMIN_INIT_USERNAME");
        String email = env.getProperty("ADMIN_INIT_EMAIL");
        String password = env.getProperty("ADMIN_INIT_PASSWORD");
        if (username == null || username.isBlank() || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            log.info("Nessun admin nel DB. Per creare il primo admin imposta nel .env: ADMIN_INIT_USERNAME, ADMIN_INIT_EMAIL, ADMIN_INIT_PASSWORD e riavvia.");
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(username.trim());
        admin.setEmail(email.trim());
        admin.setPasswordHash(passwordEncoder.encode(password));
        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                adminUserRepository.save(admin);
                log.info("Creato il primo admin: username={}", admin.getUsername());
                return;
            } catch (DataAccessException e) {
                if (attempt == maxAttempts) {
                    log.warn("Impossibile creare l'admin dopo {} tentativi (DB occupato?): {}", maxAttempts, e.getMessage());
                    throw e;
                }
                try {
                    TimeUnit.MILLISECONDS.sleep(500);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
    }
}
