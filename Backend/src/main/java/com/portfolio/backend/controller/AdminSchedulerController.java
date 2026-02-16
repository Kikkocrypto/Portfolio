package com.portfolio.backend.controller;

import com.portfolio.backend.service.DataRetentionScheduleHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for admin-only read of scheduler info (e.g. next data retention run).
 */
@RestController
@RequestMapping("/api/admin/scheduler")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSchedulerController {

    private final DataRetentionScheduleHolder dataRetentionScheduleHolder;

    public AdminSchedulerController(DataRetentionScheduleHolder dataRetentionScheduleHolder) {
        this.dataRetentionScheduleHolder = dataRetentionScheduleHolder;
    }

    /**
     * Returns the next scheduled run of the data retention job (contacts + audit logs cleanup).
     * Updated each time the job runs.
     * Handles both /data-retention-next-run and base path (e.g. redirects or trailing slash).
     */
    @GetMapping(value = { "/data-retention-next-run", "", "/" })
    public ResponseEntity<Map<String, Object>> getDataRetentionNextRun() {
        Instant next = dataRetentionScheduleHolder.getNextRun();
        Map<String, Object> body = new HashMap<>();
        body.put("nextRun", next != null ? next.toString() : null);
        return ResponseEntity.ok(body);
    }
}
