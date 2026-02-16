package com.portfolio.backend.service;

import com.portfolio.backend.controller.dto.AuditLogResponse;
import com.portfolio.backend.entity.AuditLog;
import com.portfolio.backend.exception.AuditLogNotFoundException;
import com.portfolio.backend.repository.AuditLogRepository;
import com.portfolio.backend.repository.AuditLogSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Servizio per la scrittura e lettura degli audit log.
 * La scrittura usa REQUIRES_NEW per essere persistita anche se la transazione chiamante fallisce.
 * IP e User-Agent vengono salvati come hash SHA-256 (hex) per ridurre il rischio privacy.
 */
@Service
public class AuditLogService {

    private static final String HASH_ALGORITHM = "SHA-256";
    private static final int AUDIT_LOGS_PAGE_SIZE = 20;

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Registra un evento di audit. IP e User-Agent vengono hashati (SHA-256) prima del salvataggio.
     * Gli altri campi opzionali possono essere null.
     *
     * @param actor       chi ha eseguito l'azione (es. username o "anonymous")
     * @param action      tipo di azione (es. LOGIN_SUCCESS, LOGIN_FAILURE, VIEW_MESSAGES)
     * @param resourceType tipo risorsa (es. CONTACT), opzionale
     * @param resourceId  id risorsa (es. UUID), opzionale
     * @param details     dettagli in testo libero, opzionale
     * @param ipAddress   IP client in chiaro; salvato come hash, opzionale
     * @param userAgent   User-Agent in chiaro; salvato come hash, opzionale
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = false)
    public void log(String actor, String action, String resourceType, String resourceId,
                    String details, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setActor(actor != null ? actor : "anonymous");
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDetails(details);
        log.setIpAddress(hashOrNull(ipAddress));
        log.setUserAgent(hashOrNull(userAgent));
        auditLogRepository.save(log);
    }

    /**
     * Hash SHA-256 in esadecimale (64 caratteri). Restituisce null se input è null o blank.
     */
    private String hashOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(HASH_ALGORITHM + " non disponibile", e);
        }
    }

    /**
     * Versione semplificata: solo actor e action.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = false)
    public void log(String actor, String action) {
        log(actor, action, null, null, null, null, null);
    }

    /**
     * Returns a single audit log by ID. Read-only; does not expose entity.
     *
     * @throws AuditLogNotFoundException if no audit log exists with the given ID
     */
    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(String id) {
        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(AuditLogNotFoundException::new);
        return toAuditLogResponse(log);
    }

    /**
     * Returns a page of audit logs ordered by timestamp (createdAt) DESC.
     * Page size is fixed to {@value #AUDIT_LOGS_PAGE_SIZE}; page index is 0-based.
     * Read-only; does not expose entities.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(int page) {
        return getAuditLogs(page, null, null, null, null);
    }

    /**
     * Returns a page of audit logs with optional filters, ordered by timestamp DESC.
     *
     * @param page     0-based page index
     * @param action   optional exact action filter (e.g. LOGIN_FAILURE)
     * @param actor    optional substring match on actor (e.g. user email)
     * @param dateFrom optional start of timestamp range (inclusive)
     * @param dateTo   optional end of timestamp range (inclusive)
     */
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(int page, String action, String actor,
                                                Instant dateFrom, Instant dateTo) {
        int safePage = Math.max(0, page);
        Pageable pageable = PageRequest.of(safePage, AUDIT_LOGS_PAGE_SIZE);
        boolean hasFilters = (action != null && !action.isBlank())
                || (actor != null && !actor.isBlank())
                || dateFrom != null
                || dateTo != null;
        if (!hasFilters) {
            return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toAuditLogResponse);
        }
        Specification<AuditLog> spec = AuditLogSpecification.withFilters(action, actor, dateFrom, dateTo);
        return auditLogRepository.findAll(spec, pageable).map(this::toAuditLogResponse);
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        if (log == null) {
            return null;
        }
        return AuditLogResponse.builder()
                .id(log.getId())
                .actor(log.getActor())
                .action(log.getAction())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .timestamp(log.getCreatedAt())
                .build();
    }
}
