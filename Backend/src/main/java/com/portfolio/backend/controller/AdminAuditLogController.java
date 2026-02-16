package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.AuditLogResponse;
import com.portfolio.backend.controller.dto.PagedAuditLogsResponse;
import com.portfolio.backend.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

/**
 * REST controller for admin-only retrieval of audit logs.
 * Requires JWT and role ADMIN. Audit logs are read-only.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    public AdminAuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Returns a single audit log by ID. Invalid UUID yields 400; missing log yields 404.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable String id) {
        AuditLogResponse response = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns paginated audit logs ordered by timestamp DESC.
     * Optional filters: action (exact), userEmail (substring on actor), dateFrom, dateTo (ISO date or date-time).
     */
    @GetMapping
    public ResponseEntity<PagedAuditLogsResponse> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        int safePage = Math.max(0, page);
        Instant from = parseDateParam(dateFrom, true);
        Instant to = parseDateParam(dateTo, false);
        Page<AuditLogResponse> logs = auditLogService.getAuditLogs(safePage, action, userEmail, from, to);
        PagedAuditLogsResponse body = PagedAuditLogsResponse.builder()
                .content(logs.getContent())
                .totalPages(logs.getTotalPages())
                .totalElements(logs.getTotalElements())
                .number(logs.getNumber())
                .size(logs.getSize())
                .first(logs.isFirst())
                .last(logs.isLast())
                .build();
        return ResponseEntity.ok(body);
    }

    /** Parse date string (YYYY-MM-DD or ISO-8601) to start-of-day or end-of-day Instant. Returns null on invalid. */
    private static Instant parseDateParam(String value, boolean startOfDay) {
        if (value == null || value.isBlank()) return null;
        try {
            if (value.length() <= 10) {
                LocalDate d = LocalDate.parse(value.trim());
                return startOfDay ? d.atStartOfDay(ZoneOffset.UTC).toInstant()
                        : d.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusNanos(1);
            }
            return Instant.parse(value.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
