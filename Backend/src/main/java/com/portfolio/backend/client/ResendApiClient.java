package com.portfolio.backend.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.lang.Nullable;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
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
        // configurazione del client HTTP per la connessione a Resend
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(15));
        // configurazione del client RestClient per la connessione a Resend
        this.restClient = RestClient.builder()
                .baseUrl(RESEND_API_URL)
                .requestFactory(requestFactory)
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
        return sendEmail(from, to, subject, html, null);
    }

    /**
     * Variante con Idempotency-Key per retry sicuro (no duplicati).
     * Resend deduplica richieste con la stessa key per ~24h e ritorna la stessa response.
     */
    public boolean sendEmail(String from, String to, String subject, String html, @Nullable String idempotencyKey) {
        if (to == null || to.isBlank()) {
            log.warn("Resend: to address is empty, skip send");
            return false;
        }
        String effectiveFrom = (from != null && !from.isBlank()) ? from : this.fromEmail;
        if (effectiveFrom.isBlank()) {
            log.warn("Resend: from address is empty, skip send");
            return false;
        }

        Map<String, Object> body = Map.of(
                "from", effectiveFrom,
                "to", List.of(to),
                "subject", subject != null ? subject : "",
                "html", html != null ? html : ""
        );

        int maxAttempts = 3;
        long backoffMs = 500;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            long startMs = System.currentTimeMillis();
            log.info("Resend: invio richiesta avviata attempt={}/{} thread={}", attempt, maxAttempts, Thread.currentThread().getName());
            try {
                RestClient.RequestBodySpec request = restClient.post().body(body);
                if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                    request = request.header("Idempotency-Key", idempotencyKey.trim());
                }
                request.retrieve().toBodilessEntity();
                long durationMs = System.currentTimeMillis() - startMs;
                log.info("Resend: invio completato in {}ms attempt={}/{} thread={}", durationMs, attempt, maxAttempts, Thread.currentThread().getName());
                return true;
            } catch (Exception e) {
                long durationMs = System.currentTimeMillis() - startMs;

                // 409 su idempotency (concorrenza o payload diverso) -> retry utile (se concorrenza) o stop (payload mismatch).
                if (e instanceof RestClientResponseException rre) {
                    int status = rre.getStatusCode().value();
                    if (status == 409 && attempt < maxAttempts) {
                        log.warn("Resend: 409 su idempotency dopo {}ms attempt={}/{} -> retry dopo {}ms", durationMs, attempt, maxAttempts, backoffMs);
                        sleepQuietly(backoffMs);
                        backoffMs *= 2;
                        continue;
                    }
                }

                // Errori di rete/timeout: retry solo se abbiamo Idempotency-Key (per evitare duplicati).
                boolean retryableNetwork = e instanceof ResourceAccessException;
                if (retryableNetwork && attempt < maxAttempts && idempotencyKey != null && !idempotencyKey.isBlank()) {
                    log.warn("Resend: errore rete dopo {}ms attempt={}/{} -> retry dopo {}ms (class={})", durationMs, attempt, maxAttempts, backoffMs, e.getClass().getSimpleName());
                    sleepQuietly(backoffMs);
                    backoffMs *= 2;
                    continue;
                }

                boolean connectionReset = e instanceof ResourceAccessException
                        && e.getMessage() != null
                        && e.getMessage().contains("Connection reset");
                if (connectionReset) {
                    log.warn("Resend: connection reset dopo {}ms attempt={}/{} - la richiesta può essere stata comunque elaborata da Resend; verificare la casella (class={})", durationMs, attempt, maxAttempts, e.getClass().getSimpleName());
                } else {
                    log.error("Resend: invio fallito dopo {}ms attempt={}/{} thread={} - {} (class={})", durationMs, attempt, maxAttempts, Thread.currentThread().getName(), e.getMessage(), e.getClass().getSimpleName(), e);
                }
                return false;
            }
        }
        return false;
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

    private static void sleepQuietly(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
