package com.portfolio.backend.service;

import com.portfolio.backend.entity.Contact;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Invia una notifica email all'owner quando arriva un nuovo messaggio di contatto.
 * Se la configurazione SMTP o l'email di destinazione non sono presenti, la notifica viene semplicemente ignorata.
 */
@Service
public class ContactMailService {

    private static final Logger log = LoggerFactory.getLogger(ContactMailService.class);

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
     * Invia una mail di notifica con i dati del contatto.
     * Errori di invio vengono loggati ma non influiscono sulla risposta dell'API.
     */
    public void sendContactNotification(@NonNull Contact contact) {
        if (notificationEmail.isEmpty()) {
            log.debug("Notifica contatti disabilitata: app.contact.notification-email non configurata");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (!fromEmail.isEmpty()) {
                message.setFrom(fromEmail);
            }
            message.setTo(notificationEmail);
            message.setSubject("Nuovo messaggio dal form contatti");

            StringBuilder body = new StringBuilder();
            body.append("Hai ricevuto un nuovo messaggio dal form contatti.\n\n");
            body.append("Nome: ").append(safe(contact.getName())).append("\n");
            body.append("Email: ").append(safe(contact.getEmail())).append("\n\n");
            body.append("Messaggio:\n");
            body.append(safe(contact.getMessage())).append("\n");

            message.setText(body.toString());
            mailSender.send(message);
            log.info("Email di notifica contatto inviata a {}", notificationEmail);
        } catch (Exception e) {
            log.error("Errore invio email notifica contatto: {}", e.getMessage(), e);
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}

