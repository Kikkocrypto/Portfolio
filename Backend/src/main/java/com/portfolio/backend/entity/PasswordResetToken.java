package com.portfolio.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

import org.hibernate.annotations.GenericGenerator;

/**
 * Token temporaneo per il reset della password.
 * One-time use: una volta utilizzato o scaduto, viene invalidato.
 */
@Entity
@Table(name = "password_reset_tokens", indexes = {
    @Index(name = "idx_token", columnList = "token"),
    @Index(name = "idx_admin_user_id", columnList = "admin_user_id")
})
@Getter
@Setter
public class PasswordResetToken {

    @Id
    @GeneratedValue(generator = "uuid-string")
    @GenericGenerator(name = "uuid-string", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    /**
     * Token UUID generato in modo sicuro.
     */
    @NotBlank
    @Column(nullable = false, unique = true, length = 255)
    private String token;

    /**
     * ID dell'utente admin (FK come String per evitare conversioni hex di SQLite).
     * L'utente va caricato manualmente nel service via adminUserRepository.findById().
     */
    @NotNull
    @Column(name = "admin_user_id", nullable = false, length = 36)
    private String adminUserId;

    /**
     * Timestamp di creazione del token.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Timestamp di scadenza del token.
     */
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /**
     * Indica se il token è stato già utilizzato (one-time use).
     */
    @Column(nullable = false)
    private boolean used = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /**
     * Verifica se il token è ancora valido:
     * - non utilizzato
     * - non scaduto
     */
    public boolean isValid() {
        return !used && Instant.now().isBefore(expiresAt);
    }
}
