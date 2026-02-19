package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.ApiError;
import com.portfolio.backend.controller.dto.ContactRequest;
import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.service.ContactMailService;
import com.portfolio.backend.service.ContactService;
import com.portfolio.backend.util.XssSanitizer;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);
    private static final String MSG_NO_HTML = "Nome, email e messaggio non possono contenere tag HTML o i caratteri < e >. Usa solo testo semplice.";

    private final ContactService contactService;
    private final ContactMailService contactMailService;

    public ContactController(ContactService contactService,
                             ContactMailService contactMailService) {
        this.contactService = contactService;
        this.contactMailService = contactMailService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ContactRequest request) {
        long requestStartMs = System.currentTimeMillis();
        log.info("POST /api/contacts ricevuta thread={}", Thread.currentThread().getName());
        // Normalizza input (trim email/name, formatta il nome, ecc.)
        request.normalize();

        // Honeypot: se "website" è compilato = bot → risposta 201 finta, non salvare
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Messaggio inviato con successo."
                    ));
        }

        // Rifiuta input che contengono HTML/tag: messaggio chiaro invece di errore 500
        if (containsHtmlOrAngleBrackets(request.getName()) || containsHtmlOrAngleBrackets(request.getEmail()) || containsHtmlOrAngleBrackets(request.getMessage())) {
            ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), MSG_NO_HTML);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(apiError);
        }

        // Sanitizzazione XSS: strip HTML da campi che possono essere mostrati in admin/frontend
        Contact contact = new Contact();
        contact.setName(XssSanitizer.stripHtml(request.getName()));
        contact.setEmail(XssSanitizer.stripHtml(request.getEmail()));
        contact.setMessage(XssSanitizer.stripHtml(request.getMessage()));

        Contact saved = contactService.save(contact);
        long saveMs = System.currentTimeMillis() - requestStartMs;
        log.info("POST /api/contacts contact salvato id={} in {}ms, avvio invio email async thread={}", saved.getId(), saveMs, Thread.currentThread().getName());
        // Prova ad inviare una mail di notifica all'owner (eventuali errori sono ignorati)
        contactMailService.sendContactNotification(saved);
        long totalMs = System.currentTimeMillis() - requestStartMs;
        log.info("POST /api/contacts risposta 201 in {}ms (email in background) thread={}", totalMs, Thread.currentThread().getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "success", true,
                        "message", "Messaggio inviato con successo."
                ));
    }

    /**
     * Indica se la stringa contiene caratteri che suggeriscono HTML/tag (es. &lt; &gt;).
     * Usato per restituire 400 con messaggio chiaro invece di procedere con sanitizzazione.
     */
    private static boolean containsHtmlOrAngleBrackets(String value) {
        if (value == null || value.isEmpty()) return false;
        return value.indexOf('<') >= 0 || value.indexOf('>') >= 0;
    }
}
