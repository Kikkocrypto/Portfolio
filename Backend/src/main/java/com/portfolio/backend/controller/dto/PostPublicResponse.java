package com.portfolio.backend.controller.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Public response DTO for a single published post in a given locale.
 * No admin-only or sensitive fields (e.g. status) are exposed.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostPublicResponse {

    private String id;
    private String slug;
    private String title;
    private String content;
    private String locale;

    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    private Instant createdAt;
}
