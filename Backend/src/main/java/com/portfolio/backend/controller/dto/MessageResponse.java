package com.portfolio.backend.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DTO for a single contact form message in admin responses.
 * Exposes receivedAt (API) mapped from entity createdAt.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private String id;
    private String name;
    private String email;
    private String message;
    private Instant receivedAt;
}
