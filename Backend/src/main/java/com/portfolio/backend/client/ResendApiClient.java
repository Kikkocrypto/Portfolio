package com.portfolio.backend.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Client per l'API Resend (invio email via HTTPS, compatibile con Render free tier).
 * Usa Bearer token e POST /emails con JSON from, to, subject, html.
 *
 * @see <a href="https://resend.com/docs/api-reference/emails/send-email">Resend Send Email</a>
 */
public class ResendApiClient {

    private static final Logger log = LoggerFactory.getLogger(ResendApiClient.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestClient restClient;
    private final String fromEmail;

    public ResendApiClient(String apiKey, String fromEmail) {
        this.fromEmail = fromEmail != null ? fromEmail.trim() : "";
        this.restClient = RestClient.builder()
                .baseUrl(RESEND_API_URL)
                .defaultHeader("Authorization", "Bearer " + (apiKey != null ? apiKey.trim() : ""))
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Invia un'email tramite Resend API.
     *
     * @param from    Mittente (es. "Portfolio &lt;noreply@domain.com&gt;" o "onboarding@resend.dev")
     * @param to      Destinatario
     * @param subject Oggetto
     * @param html    Corpo HTML
     * @return true se inviata con successo (2xx)
     */
    public boolean sendEmail(String from, String to, String subject, String html) {
        if (to == null || to.isBlank()) {
            log.warn("Resend: to address is empty, skip send");
            return false;
        }
        String effectiveFrom = (from != null && !from.isBlank()) ? from : this.fromEmail;
        if (effectiveFrom.isBlank()) {
            log.warn("Resend: from address is empty, skip send");
            return false;
        }
        try {
            Map<String, Object> body = Map.of(
                    "from", effectiveFrom,
                    "to", List.of(to),
                    "subject", subject != null ? subject : "",
                    "html", html != null ? html : ""
            );
            restClient.post()
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Resend: email sent to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Resend: send failed - {}", e.getMessage(), e);
            return false;
        }
    }

    public String getFromEmail() {
        return fromEmail;
    }
}
