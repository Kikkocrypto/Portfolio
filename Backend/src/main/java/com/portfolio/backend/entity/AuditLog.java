package com.portfolio.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

/**
 * Registro delle azioni rilevanti per audit (login, accesso risorse admin, ecc.).
 * Tabella: audit_logs.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_logs_created_at", columnList = "created_at"),
    @Index(name = "idx_audit_logs_actor", columnList = "actor"),
    @Index(name = "idx_audit_logs_action", columnList = "action")
})
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(generator = "uuid-string")
    @GenericGenerator(name = "uuid-string", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    /**
     * Chi ha eseguito l'azione (username admin o "anonymous").
     */
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String actor;

    /**
     * Tipo di azione (es. LOGIN_SUCCESS, LOGIN_FAILURE, VIEW_MESSAGES, VIEW_MESSAGE).
     */
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String action;

    /**
     * Tipo di risorsa coinvolta (es. CONTACT, POST, ADMIN_USER), opzionale.
     */
    @Size(max = 50)
    @Column(name = "resource_type", length = 50)
    private String resourceType;

    /**
     * ID della risorsa (es. UUID del messaggio), opzionale.
     */
    @Size(max = 36)
    @Column(name = "resource_id", length = 36)
    private String resourceId;

    /**
     * Dettagli aggiuntivi in testo libero o JSON, opzionale.
     */
    @Column(columnDefinition = "TEXT")
    private String details;

    /**
     * Hash SHA-256 (hex, 64 caratteri) dell'indirizzo IP del client. Opzionale.
     */
    @Size(max = 64)
    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    /**
     * Hash SHA-256 (hex, 64 caratteri) dello User-Agent della richiesta. Opzionale.
     */
    @Size(max = 64)
    @Column(name = "user_agent", length = 64)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
