package com.portfolio.backend.service;

import com.portfolio.backend.repository.AuditLogRepository;
import com.portfolio.backend.repository.ContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Servizio per la cancellazione automatica (hard delete) dei dati oltre il periodo di retention.
 * Esegue cancellazioni in batch per ridurre lock e carico su dataset grandi.
 * Separato dalla logica REST; usato dal job schedulato {@link com.portfolio.backend.scheduler.DataRetentionJob}.
 */
@Service
public class DataRetentionService {

    private static final Logger log = LoggerFactory.getLogger(DataRetentionService.class);

    private final ContactRepository contactRepository;
    private final AuditLogRepository auditLogRepository;

    /** Dimensione del batch per ogni transazione di delete (default 500). */
    @Value("${app.data-retention.batch-size:500}")
    private int batchSize;

    public DataRetentionService(ContactRepository contactRepository,
                                AuditLogRepository auditLogRepository) {
        this.contactRepository = contactRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Elimina in un'unica transazione al massimo {@code batchSize} contact con {@code createdAt < cutoff}.
     * Restituisce il numero di record eliminati (0 se non ce n'è nessuno in questo batch).
     *
     * @param cutoff data di cutoff (esclusiva)
     * @return numero di contact eliminati in questo batch
     */
    @Transactional
    public int deleteContactsOlderThanBatch(Instant cutoff) {
        log.debug("deleteContactsOlderThanBatch: cutoff={}, batchSize={}", cutoff, batchSize);
        int deleted = contactRepository.deleteByCreatedAtBefore(cutoff);
        log.debug("Deleted {} contacts", deleted);
        return deleted;
    }

    /**
     * Elimina in un'unica transazione al massimo {@code batchSize} audit log con {@code createdAt < cutoff}.
     *
     * @param cutoff data di cutoff (esclusiva)
     * @return numero di audit log eliminati in questo batch
     */
    @Transactional
    public int deleteAuditLogsOlderThanBatch(Instant cutoff) {
        log.debug("deleteAuditLogsOlderThanBatch: cutoff={}, batchSize={}", cutoff, batchSize);
        int deleted = auditLogRepository.deleteByCreatedAtBefore(cutoff);
        log.debug("Deleted {} audit logs", deleted);
        return deleted;
    }
}
