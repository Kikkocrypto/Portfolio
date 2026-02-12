package com.portfolio.backend.config.security;

import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.ContactRateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Applica il rate limiting in-memory solo su POST /api/contacts.
 * Chiave: IP client (X-Forwarded-For se presente, altrimenti RemoteAddr).
 * In caso di superamento limite registra un audit log con actor "anonymous".
 */
public class ContactRateLimitFilter extends OncePerRequestFilter {

    private static final String CONTACTS_PATH = "/api/contacts";
    private static final String METHOD_POST = "POST";
    private static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
    private static final String RESOURCE_CONTACT = "CONTACT";

    private final ContactRateLimitService rateLimitService;
    private final AuditLogService auditLogService;

    public ContactRateLimitFilter(ContactRateLimitService rateLimitService, AuditLogService auditLogService) {
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (!METHOD_POST.equalsIgnoreCase(request.getMethod()) || !request.getRequestURI().equals(CONTACTS_PATH)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        if (!rateLimitService.tryAcquire(clientKey)) {
            auditLogService.log("anonymous", RATE_LIMIT_EXCEEDED, RESOURCE_CONTACT, null, null, resolveIp(request), request.getHeader("User-Agent"));
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Troppe richieste. Riprova più tardi.\"}");
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
