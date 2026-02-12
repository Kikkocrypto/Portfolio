package com.portfolio.backend.config.security;

import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.PublicPostRateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Applies in-memory rate limiting only to GET /api/posts/{locale}.
 * Client key: IP (X-Forwarded-For if present, otherwise RemoteAddr).
 * When limit is exceeded, returns HTTP 429 and records audit log with actor "anonymous".
 */
public class PublicPostRateLimitFilter extends OncePerRequestFilter {

    private static final String METHOD_GET = "GET";
    /** Path prefix for locale-based list: /api/posts/{locale} */
    private static final String PATH_PREFIX = "/api/posts/";
    private static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
    private static final String RESOURCE_PUBLIC_POSTS = "PUBLIC_POSTS";

    private final PublicPostRateLimitService rateLimitService;
    private final AuditLogService auditLogService;

    public PublicPostRateLimitFilter(PublicPostRateLimitService rateLimitService, AuditLogService auditLogService) {
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        boolean isPublicPostsByLocale = METHOD_GET.equalsIgnoreCase(request.getMethod())
                && uri != null
                && uri.startsWith(PATH_PREFIX)
                && uri.length() > PATH_PREFIX.length(); // at least one character for locale

        if (!isPublicPostsByLocale) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        if (!rateLimitService.tryAcquire(clientKey)) {
            auditLogService.log("anonymous", RATE_LIMIT_EXCEEDED, RESOURCE_PUBLIC_POSTS, null, null, resolveIp(request), request.getHeader("User-Agent"));
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\":\"Too many requests. Try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
