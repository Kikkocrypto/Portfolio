package com.portfolio.backend.service;

import com.portfolio.backend.client.ResendApiClient;
import com.portfolio.backend.entity.Contact;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Invia una notifica email all'owner quando arriva un nuovo messaggio di contatto.
 * Se {@link ResendApiClient} è configurato (RESEND_API_KEY), usa Resend (HTTPS); altrimenti SMTP (JavaMailSender).
 * Email HTML con grafica in stile portfolio e logo DF.
 */
@Service
public class ContactMailService {

    private static final Logger log = LoggerFactory.getLogger(ContactMailService.class);
    private static final String TEMPLATE_NOTIFICATION = "templates/contact-notification-email.html";
    private static final String TEMPLATE_REPLY = "templates/contact-reply-email.html";
    private static final String SUBJECT_NOTIFICATION = "Nuovo messaggio dal form contatti";
    private static final String SUBJECT_REPLY = "Messaggio ricevuto – Francesco Damiano";

    private final JavaMailSender mailSender;
    private final String notificationEmail;
    private final String smtpFromEmail;
    private final boolean sendReplyToSender;
    private final ResendApiClient resendClient;

    public ContactMailService(
            @Autowired(required = false) @Nullable JavaMailSender mailSender,
            @Value("${app.contact.notification-email:}") @Nullable String notificationEmail,
            @Value("${app.contact.send-reply-to-sender:true}") boolean sendReplyToSender,
            @Value("${spring.mail.username:}") @Nullable String smtpFromEmail,
            @Autowired(required = false) @Nullable ResendApiClient resendClient) {
        this.mailSender = mailSender;
        this.notificationEmail = notificationEmail != null ? notificationEmail.trim() : "";
        this.sendReplyToSender = sendReplyToSender;
        this.smtpFromEmail = smtpFromEmail != null ? smtpFromEmail.trim() : "";
        this.resendClient = resendClient;
    }

    /**
     * Invia una mail di notifica HTML con i dati del contatto (template con logo DF).
     * Se Resend è configurato usa l'API Resend (funziona su Render free); altrimenti SMTP.
     * Eseguito in background; errori loggati, non influiscono sulla risposta API.
     */
    /**
     * Invia (1) notifica all'owner e (2) risposta automatica al mittente, se abilitata.
     */
    @Async
    public void sendContactNotification(@NonNull Contact contact) {
        sendNotificationToOwner(contact);
        if (sendReplyToSender) {
            sendReplyToSender(contact);
        }
    }

    private void sendNotificationToOwner(@NonNull Contact contact) {
        if (notificationEmail.isEmpty()) {
            log.debug("Notifica contatti disabilitata: app.contact.notification-email non configurata");
            return;
        }
        try {
            String html = loadTemplate(TEMPLATE_NOTIFICATION);
            String name = escapeHtml(safe(contact.getName()));
            String email = escapeHtml(safe(contact.getEmail()));
            String message = escapeHtml(safe(contact.getMessage()));

            html = html.replace("${name}", name)
                    .replace("${email}", email)
                    .replace("${message}", message);

            if (resendClient != null) {
                String from = resendClient.getFromEmail();
                if (from.isEmpty()) {
                    from = "Portfolio <onboarding@resend.dev>";
                }
                boolean sent = resendClient.sendEmail(from, notificationEmail, SUBJECT_NOTIFICATION, html);
                if (sent) {
                    log.info("Email di notifica contatto inviata via Resend a {}", notificationEmail);
                }
                return;
            }
            if (mailSender == null) {
                log.warn("Notifica contatto non inviata: né Resend né SMTP configurati");
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());
            if (!smtpFromEmail.isEmpty()) {
                helper.setFrom(smtpFromEmail);
            }
            helper.setTo(notificationEmail);
            helper.setSubject(SUBJECT_NOTIFICATION);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
            log.info("Email di notifica contatto inviata (SMTP) a {}", notificationEmail);
        } catch (Exception e) {
            log.error("Errore invio email notifica contatto: {}", e.getMessage(), e);
        }
    }

    /**
     * Invia al mittente del form una risposta automatica (template contact-reply-email.html).
     */
    private void sendReplyToSender(@NonNull Contact contact) {
        String toEmail = contact.getEmail();
        if (toEmail == null || toEmail.isBlank()) {
            log.debug("Risposta al mittente saltata: email contatto vuota");
            return;
        }
        try {
            String html = loadTemplate(TEMPLATE_REPLY);
            String name = escapeHtml(safe(contact.getName()));
            if (name.isEmpty()) {
                name = "there";
            }
            html = html.replace("${name}", name);

            if (resendClient != null) {
                String from = resendClient.getFromEmail();
                if (from.isEmpty()) {
                    from = "Portfolio <onboarding@resend.dev>";
                }
                boolean sent = resendClient.sendEmail(from, toEmail.trim(), SUBJECT_REPLY, html);
                if (sent) {
                    log.info("Risposta automatica contatto inviata via Resend a {}", toEmail);
                }
                return;
            }
            if (mailSender == null) {
                log.warn("Risposta al mittente non inviata: né Resend né SMTP configurati");
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());
            if (!smtpFromEmail.isEmpty()) {
                helper.setFrom(smtpFromEmail);
            }
            helper.setTo(toEmail.trim());
            helper.setSubject(SUBJECT_REPLY);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
            log.info("Risposta automatica contatto inviata (SMTP) a {}", toEmail);
        } catch (Exception e) {
            log.error("Errore invio risposta automatica al mittente contatto: {}", e.getMessage(), e);
        }
    }

    private String loadTemplate(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
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

