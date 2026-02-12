package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.ContactRequest;
import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.service.ContactMailService;
import com.portfolio.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;
    private final ContactMailService contactMailService;

    public ContactController(ContactService contactService,
                             ContactMailService contactMailService) {
        this.contactService = contactService;
        this.contactMailService = contactMailService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ContactRequest request) {
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

        Contact contact = new Contact();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setMessage(request.getMessage());

        Contact saved = contactService.save(contact);
        // Prova ad inviare una mail di notifica all'owner (eventuali errori sono ignorati)
        contactMailService.sendContactNotification(saved);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "success", true,
                        "message", "Messaggio inviato con successo."
                ));
    }
}
