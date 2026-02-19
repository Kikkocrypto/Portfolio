package com.portfolio.backend.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.ResourceAccessException;
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
        long startMs = System.currentTimeMillis();
        log.info("Resend: invio richiesta avviata thread={}", Thread.currentThread().getName());
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
            long durationMs = System.currentTimeMillis() - startMs;
            log.info("Resend: invio completato in {}ms thread={}", durationMs, Thread.currentThread().getName());
            return true;
        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - startMs;
            boolean connectionReset = e instanceof ResourceAccessException && e.getMessage() != null && e.getMessage().contains("Connection reset");
            if (connectionReset) {
                log.warn("Resend: connection reset dopo {}ms - la richiesta può essere stata comunque elaborata da Resend; verificare la casella (class={})", durationMs, e.getClass().getSimpleName());
            } else {
                log.error("Resend: invio fallito dopo {}ms thread={} - {} (class={})", durationMs, Thread.currentThread().getName(), e.getMessage(), e.getClass().getSimpleName(), e);
            }
            return false;
        }
    }

    public String getFromEmail() {
        return fromEmail;
    }

    /**
     * Apre la connessione verso api.resend.com (warm-up).
     * Utile su Render free: la prima richiesta in uscita dopo cold start può andare in timeout;
     * chiamando warmUp() all'avvio, il primo invio email dell'utente usa già una connessione calda.
     */
    public void warmUp() {
        long startMs = System.currentTimeMillis();
        log.info("Resend: warm-up avviato thread={}", Thread.currentThread().getName());
        try {
            restClient.get().retrieve().toBodilessEntity();
        } catch (Exception e) {
            // GET su /emails restituisce 405; va bene: serve solo ad aprire TCP/TLS
            long durationMs = System.currentTimeMillis() - startMs;
            log.info("Resend: warm-up completato in {}ms (connessione aperta, risposta attesa: {})", durationMs, e.getClass().getSimpleName());
        }
    }
}
