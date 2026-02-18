package com.portfolio.backend.config;

import com.portfolio.backend.client.ResendApiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configura il client Resend (invio email via API HTTPS).
 * Il bean è creato solo se {@code app.resend.api-key} è impostata e non vuota (es. RESEND_API_KEY su Render).
 */
@Configuration
public class ResendConfig {

    @Bean
    @ConditionalOnResendApiKey
    public ResendApiClient resendApiClient(
            @Value("${app.resend.api-key:}") String apiKey,
            @Value("${app.resend.from-email:}") String fromEmail) {
        return new ResendApiClient(apiKey, fromEmail);
    }
}
