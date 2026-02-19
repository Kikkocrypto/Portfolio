package com.portfolio.backend.config;

import com.portfolio.backend.client.ResendApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

/**
 * All'avvio, se il client Resend è configurato, esegue un warm-up della connessione
 * verso api.resend.com. Su Render free tier la prima richiesta HTTP in uscita dopo
 * cold start può andare in timeout; scalando la connessione qui, il primo invio
 * email dal form contatti usa già una connessione calda.
 */
@Component
public class ResendWarmupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ResendWarmupRunner.class);

    private final ResendApiClient resendClient;

    public ResendWarmupRunner(@Autowired(required = false) @Nullable ResendApiClient resendClient) {
        this.resendClient = resendClient;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (resendClient == null) {
            return;
        }
        try {
            resendClient.warmUp();
            log.info("Resend client warm-up completed (prima connessione verso api.resend.com aperta)");
        } catch (Exception e) {
            log.warn("Resend warm-up non critico fallito: {}", e.getMessage());
        }
    }
}
