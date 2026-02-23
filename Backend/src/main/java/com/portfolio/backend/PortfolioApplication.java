package com.portfolio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point dell'applicazione portfolio backend.
 * Abilita lo scheduling per i job automatici (es. data retention: eliminazione
 * contact e audit log più vecchi di N giorni).
 * Esclude UserDetailsServiceAutoConfiguration per evitare il log della password
 * generata (l'autenticazione usa JWT e admin dal DB).
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
@EnableAsync
public class PortfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }
}
