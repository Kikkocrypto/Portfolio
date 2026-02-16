package com.portfolio.backend.service;

import com.portfolio.backend.entity.Contact;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Invia una notifica email all'owner quando arriva un nuovo messaggio di contatto.
 * Email HTML con grafica in stile portfolio e logo DF.
 * Se la configurazione SMTP o l'email di destinazione non sono presenti, la notifica viene ignorata.
 */
@Service
public class ContactMailService {

    private static final Logger log = LoggerFactory.getLogger(ContactMailService.class);
    private static final String TEMPLATE_PATH = "templates/contact-notification-email.html";

    private final JavaMailSender mailSender;
    private final String notificationEmail;
    private final String fromEmail;

    public ContactMailService(
            JavaMailSender mailSender,
            @Value("${app.contact.notification-email:}") @Nullable String notificationEmail,
            @Value("${spring.mail.username:}") @Nullable String fromEmail) {
        this.mailSender = mailSender;
        this.notificationEmail = notificationEmail != null ? notificationEmail.trim() : "";
        this.fromEmail = fromEmail != null ? fromEmail.trim() : "";
    }

    /**
     * Invia una mail di notifica HTML con i dati del contatto (template con logo DF).
     * Errori di invio vengono loggati ma non influiscono sulla risposta dell'API.
     */
    public void sendContactNotification(@NonNull Contact contact) {
        if (notificationEmail.isEmpty()) {
            log.debug("Notifica contatti disabilitata: app.contact.notification-email non configurata");
            return;
        }
        try {
            String html = loadTemplate();
            String name = escapeHtml(safe(contact.getName()));
            String email = escapeHtml(safe(contact.getEmail()));
            String message = escapeHtml(safe(contact.getMessage()));

            html = html.replace("${name}", name)
                    .replace("${email}", email)
                    .replace("${message}", message);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());
            if (!fromEmail.isEmpty()) {
                helper.setFrom(fromEmail);
            }
            helper.setTo(notificationEmail);
            helper.setSubject("Nuovo messaggio dal form contatti");
            helper.setText(html, true);

            mailSender.send(mimeMessage);
            log.info("Email di notifica contatto inviata a {}", notificationEmail);
        } catch (Exception e) {
            log.error("Errore invio email notifica contatto: {}", e.getMessage(), e);
        }
    }

    private String loadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }

    private String safe(String value) {
        return value != null ? value : "";
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

