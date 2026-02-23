package com.portfolio.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "email_jobs")
@Getter
@Setter
public class EmailJob {

    @Id
    @Column(length = 36)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private EmailJobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EmailJobStatus status;

    @Column(name = "contact_id", length = 36)
    private String contactId;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "next_attempt_at_ms", nullable = false)
    private long nextAttemptAtMs;

    @Column(name = "locked_at_ms")
    private Long lockedAtMs;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "created_at_ms", nullable = false, updatable = false)
    private long createdAtMs;

    @Column(name = "updated_at_ms", nullable = false)
    private long updatedAtMs;

    @PrePersist
    protected void onCreate() {
        long now = System.currentTimeMillis();
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAtMs == 0L) {
            createdAtMs = now;
        }
        if (updatedAtMs == 0L) {
            updatedAtMs = now;
        }
        if (status == null) {
            status = EmailJobStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAtMs = System.currentTimeMillis();
    }
}

