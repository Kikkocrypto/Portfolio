package com.portfolio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point dell'applicazione portfolio backend.
 * Abilita lo scheduling per i job automatici (es. data retention: eliminazione
 * contact e audit log più vecchi di N giorni).
 */
@SpringBootApplication
@EnableScheduling
public class PortfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }
}
