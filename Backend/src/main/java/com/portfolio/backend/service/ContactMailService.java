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
        log.info("ContactMail: invio avviato thread={}", Thread.currentThread().getName());
        long totalStartMs = System.currentTimeMillis();
        try {
            sendNotificationToOwner(contact);
            if (sendReplyToSender) {
                sendReplyToSender(contact);
            }
            long totalMs = System.currentTimeMillis() - totalStartMs;
            log.info("ContactMail: invio completato in {}ms thread={}", totalMs, Thread.currentThread().getName());
        } catch (Exception e) {
            long totalMs = System.currentTimeMillis() - totalStartMs;
            log.error("ContactMail: invio fallito dopo {}ms thread={} - {}", totalMs, Thread.currentThread().getName(), e.getMessage(), e);
        }
    }

    /**
     * Invio immediato notifica owner (usato dalla coda persistente).
     * Non logga dati utente (email/nome/messaggio).
     */
    public boolean sendOwnerNotification(@NonNull Contact contact) {
        return sendNotificationToOwnerInternal(contact);
    }

    /**
     * Invio immediato risposta automatica al mittente (usato dalla coda persistente).
     * Non logga dati utente (email/nome/messaggio).
     */
    public boolean sendAutoReply(@NonNull Contact contact) {
        return sendReplyToSenderInternal(contact);
    }

    private void sendNotificationToOwner(@NonNull Contact contact) {
        sendNotificationToOwnerInternal(contact);
    }

    private boolean sendNotificationToOwnerInternal(@NonNull Contact contact) {
        if (notificationEmail.isEmpty()) {
            log.debug("Notifica contatti disabilitata: app.contact.notification-email non configurata");
            return true;
        }
        long startMs = System.currentTimeMillis();
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
                log.debug("ContactMail: invio notifica owner (Resend) avviato");
                String idempotencyKey = "contact-notify/" + contact.getId();
                boolean sent = resendClient.sendEmail(from, notificationEmail, SUBJECT_NOTIFICATION, html, idempotencyKey);
                long durationMs = System.currentTimeMillis() - startMs;
                if (sent) {
                    log.info("ContactMail: notifica owner inviata via Resend in {}ms", durationMs);
                    return true;
                } else {
                    log.warn("ContactMail: notifica owner Resend ha restituito false dopo {}ms", durationMs);
                    return false;
                }
            }
            if (mailSender == null) {
                log.warn("Notifica contatto non inviata: né Resend né SMTP configurati");
                return false;
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
            long durationMs = System.currentTimeMillis() - startMs;
            log.info("ContactMail: notifica owner inviata (SMTP) in {}ms", durationMs);
            return true;
        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - startMs;
            log.error("ContactMail: notifica owner fallita dopo {}ms - {}", durationMs, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Invia al mittente del form una risposta automatica (template contact-reply-email.html).
     */
    private void sendReplyToSender(@NonNull Contact contact) {
        sendReplyToSenderInternal(contact);
    }

    private boolean sendReplyToSenderInternal(@NonNull Contact contact) {
        String toEmail = contact.getEmail();
        if (toEmail == null || toEmail.isBlank()) {
            log.debug("Risposta al mittente saltata: email contatto vuota");
            return true;
        }
        long startMs = System.currentTimeMillis();
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
                log.debug("ContactMail: invio risposta automatica (Resend) avviato");
                String idempotencyKey = "contact-reply/" + contact.getId();
                boolean sent = resendClient.sendEmail(from, toEmail.trim(), SUBJECT_REPLY, html, idempotencyKey);
                long durationMs = System.currentTimeMillis() - startMs;
                if (sent) {
                    log.info("ContactMail: risposta automatica inviata via Resend in {}ms", durationMs);
                    return true;
                } else {
                    log.warn("ContactMail: risposta automatica Resend ha restituito false dopo {}ms", durationMs);
                    return false;
                }
            }
            if (mailSender == null) {
                log.warn("Risposta al mittente non inviata: né Resend né SMTP configurati");
                return false;
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
            long durationMs = System.currentTimeMillis() - startMs;
            log.info("ContactMail: risposta automatica inviata (SMTP) in {}ms", durationMs);
            return true;
        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - startMs;
            log.error("ContactMail: risposta automatica fallita dopo {}ms - {}", durationMs, e.getMessage(), e);
            return false;
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

