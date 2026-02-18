package com.portfolio.backend.service;

import com.portfolio.backend.client.ResendApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;

/**
 * Service per l'invio di email (reset password, ecc.).
 * Se {@link ResendApiClient} è configurato usa Resend (HTTPS); altrimenti SMTP (JavaMailSender).
 *
 * @see <a href="https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email">Spring Boot Mail</a>
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESET_SUBJECT = "Reset Password - Portfolio Admin";

    private final JavaMailSender mailSender;
    private final ResendApiClient resendClient;

    @Value("${spring.mail.username:noreply@portfolio.com}")
    private String smtpFromEmail;

    public EmailService(@Autowired(required = false) @Nullable JavaMailSender mailSender,
                        @Autowired(required = false) @Nullable ResendApiClient resendClient) {
        this.mailSender = mailSender;
        this.resendClient = resendClient;
    }

    /**
     * Invia email di reset password usando template HTML.
     * Se Resend è configurato usa l'API Resend; altrimenti SMTP.
     *
     * @param toEmail Email destinatario
     * @param token Token di reset
     * @param expirationMinutes Minuti prima della scadenza
     * @param resetLink Link completo per reset (es. https://domain.com/reset?token=...)
     * @throws MessagingException se invio fallisce (solo con SMTP; Resend logga e non lancia)
     */
    public void sendPasswordResetEmail(String toEmail, String token, int expirationMinutes, String resetLink) 
            throws MessagingException {
        
        try {
            String htmlContent = loadTemplate("templates/password-reset-email.html")
                    .replace("${token}", token)
                    .replace("${expirationMinutes}", String.valueOf(expirationMinutes))
                    .replace("${resetLink}", resetLink)
                    .replace("${year}", String.valueOf(Year.now().getValue()));

            if (resendClient != null) {
                String from = resendClient.getFromEmail();
                if (from == null || from.isBlank()) {
                    from = "Portfolio <onboarding@resend.dev>";
                }
                boolean sent = resendClient.sendEmail(from, toEmail, RESET_SUBJECT, htmlContent);
                if (sent) {
                    log.info("Email di reset password inviata via Resend a: {}", maskEmail(toEmail));
                } else {
                    throw new MessagingException("Resend send returned false");
                }
                return;
            }
            if (mailSender == null) {
                throw new MessagingException("Né Resend né SMTP configurati: impossibile inviare email");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(smtpFromEmail);
            helper.setTo(toEmail);
            helper.setSubject(RESET_SUBJECT);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email di reset password inviata (SMTP) a: {}", maskEmail(toEmail));
            
        } catch (IOException e) {
            log.error("Errore caricamento template email", e);
            throw new MessagingException("Errore caricamento template", e);
        }
    }

    /**
     * Invia email di testo semplice (fallback se HTML non funziona).
     * Usa sempre SMTP; per Resend usa il metodo HTML.
     */
    public void sendPasswordResetEmailPlainText(String toEmail, String token, int expirationMinutes) 
            throws MessagingException {
        if (mailSender == null) {
            throw new MessagingException("SMTP non configurato: impossibile inviare email plain text");
        }
        String content = String.format("""
            Ciao,
            
            Hai richiesto il reset della password per il tuo account admin.
            
            Token di reset: %s
            
            Questo token scadrà tra %d minuti.
            
            Se non hai richiesto questo reset, ignora questa email.
            
            ---
            Portfolio Admin Panel
            """, token, expirationMinutes);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        helper.setFrom(smtpFromEmail);
        helper.setTo(toEmail);
        helper.setSubject(RESET_SUBJECT);
        helper.setText(content, false);
        mailSender.send(message);
        log.info("Email di reset password (plain text) inviata a: {}", maskEmail(toEmail));
    }

    /**
     * Carica template da risorse.
     */
    private String loadTemplate(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }

    /**
     * Maschera email per log sicuro.
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
