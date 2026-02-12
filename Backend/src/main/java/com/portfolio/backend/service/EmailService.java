package com.portfolio.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Year;

/**
 * Service per l'invio di email.
 * 
 * Supporta:
 * - Email HTML con template
 * - Email text semplici
 * - Placeholder replacement nei template
 * 
 * IMPORTANTE: Richiede configurazione SMTP in application.yml
 * 
 * @see <a href="https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email">Spring Boot Mail</a>
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@portfolio.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Invia email di reset password usando template HTML.
     * 
     * @param toEmail Email destinatario
     * @param token Token di reset
     * @param expirationMinutes Minuti prima della scadenza
     * @param resetLink Link completo per reset (es. https://domain.com/reset?token=...)
     * @throws MessagingException se invio fallisce
     */
    public void sendPasswordResetEmail(String toEmail, String token, int expirationMinutes, String resetLink) 
            throws MessagingException {
        
        try {
            // Carica template HTML
            String htmlTemplate = loadTemplate("templates/password-reset-email.html");
            
            // Sostituisci placeholder
            String htmlContent = htmlTemplate
                    .replace("${token}", token)
                    .replace("${expirationMinutes}", String.valueOf(expirationMinutes))
                    .replace("${resetLink}", resetLink)
                    .replace("${year}", String.valueOf(Year.now().getValue()));

            // Crea messaggio
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset Password - Portfolio Admin");
            helper.setText(htmlContent, true); // true = HTML
            
            // Invia
            mailSender.send(message);
            
            log.info("Email di reset password inviata a: {}", maskEmail(toEmail));
            
        } catch (IOException e) {
            log.error("Errore caricamento template email", e);
            throw new MessagingException("Errore caricamento template", e);
        }
    }

    /**
     * Invia email di testo semplice (fallback se HTML non funziona).
     */
    public void sendPasswordResetEmailPlainText(String toEmail, String token, int expirationMinutes) 
            throws MessagingException {
        
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
        
        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Reset Password - Portfolio Admin");
        helper.setText(content, false); // false = plain text
        
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
