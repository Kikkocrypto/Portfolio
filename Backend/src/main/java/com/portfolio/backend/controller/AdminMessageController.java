package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.MessageResponse;
import com.portfolio.backend.controller.dto.PagedMessagesResponse;
import com.portfolio.backend.service.AdminMessageService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for admin-only retrieval of contact form messages.
 * Requires JWT and role ADMIN; rate limited (10/min).
 */
@RestController
@RequestMapping("/api/admin/messages")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMessageController {

    private final AdminMessageService adminMessageService;

    public AdminMessageController(AdminMessageService adminMessageService) {
        this.adminMessageService = adminMessageService;
    }

    /**
     * Deletes a contact message by ID. Admin only; missing message 404.
     */
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        adminMessageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns a single contact message by ID. Admin only; invalid UUID yields 400, missing message 404.
     */
    @GetMapping("/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable String messageId) {
        MessageResponse message = adminMessageService.getMessageById(messageId);
        return ResponseEntity.ok(message);
    }

    /**
     * Returns paginated contact messages ordered by receivedAt DESC.
     * Page size is fixed to 10; page index defaults to 0.
     */
    @GetMapping
    public ResponseEntity<PagedMessagesResponse> getMessages(
            @RequestParam(defaultValue = "0") int page) {
        int safePage = Math.max(0, page);
        Page<MessageResponse> messages = adminMessageService.getMessages(safePage);
        PagedMessagesResponse body = PagedMessagesResponse.builder()
                .content(messages.getContent())
                .totalPages(messages.getTotalPages())
                .totalElements(messages.getTotalElements())
                .number(messages.getNumber())
                .size(messages.getSize())
                .first(messages.isFirst())
                .last(messages.isLast())
                .build();
        return ResponseEntity.ok(body);
    }
}
