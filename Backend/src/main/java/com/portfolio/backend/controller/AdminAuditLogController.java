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
     * Page size is fixed to 20; page index defaults to 0.
     */
    @GetMapping
    public ResponseEntity<PagedAuditLogsResponse> getAuditLogs(
            @RequestParam(defaultValue = "0") int page) {
        int safePage = Math.max(0, page);
        Page<AuditLogResponse> logs = auditLogService.getAuditLogs(safePage);
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
}
