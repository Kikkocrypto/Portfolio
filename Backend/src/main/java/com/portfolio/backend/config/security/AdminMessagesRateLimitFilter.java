package com.portfolio.backend.config.security;

import com.portfolio.backend.service.AdminMessagesRateLimitService;
import com.portfolio.backend.service.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Applies in-memory rate limiting to GET /api/admin/messages and GET /api/admin/messages/{id}.
 * Client key: authenticated username if present, otherwise IP (X-Forwarded-For or RemoteAddr).
 * When limit is exceeded, returns HTTP 429 and records audit log with actor "anonymous".
 */
public class AdminMessagesRateLimitFilter extends OncePerRequestFilter {

    private static final String METHOD_GET = "GET";
    private static final String PATH_PREFIX = "/api/admin/messages";
    private static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
    private static final String RESOURCE_ADMIN_MESSAGES = "ADMIN_MESSAGES";

    private final AdminMessagesRateLimitService rateLimitService;
    private final AuditLogService auditLogService;

    public AdminMessagesRateLimitFilter(AdminMessagesRateLimitService rateLimitService, AuditLogService auditLogService) {
        this.rateLimitService = rateLimitService;
        this.auditLogService = auditLogService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        boolean isAdminMessages = METHOD_GET.equalsIgnoreCase(request.getMethod())
                && (PATH_PREFIX.equals(requestUri) || requestUri.startsWith(PATH_PREFIX + "/"));

        if (!isAdminMessages) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        if (!rateLimitService.tryAcquire(clientKey)) {
            auditLogService.log("anonymous", RATE_LIMIT_EXCEEDED, RESOURCE_ADMIN_MESSAGES, null, null, resolveIp(request), request.getHeader("User-Agent"));
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"status\":429,\"details\":\"Troppe richieste. Riprova più tardi.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveClientKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
            return "user:" + auth.getName();
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return "ip:" + forwarded.split(",")[0].trim();
        }
        return "ip:" + (request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown");
    }
}
