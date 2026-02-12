package com.portfolio.backend.controller;

import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private static final String LOGIN_SUCCESS = "LOGIN_SUCCESS";
    private static final String LOGIN_FAILURE = "LOGIN_FAILURE";

    private final AuthService authService;
    private final AuditLogService auditLogService;

    public AdminAuthController(AuthService authService, AuditLogService auditLogService) {
        this.authService = authService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = resolveIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        return authService.findByUsernameOrEmail(request.login())
                .filter(user -> authService.validatePassword(user, request.password()))
                .map(user -> {
                    auditLogService.log(user.getUsername(), LOGIN_SUCCESS, null, null, null, ip, userAgent);
                    String token = authService.generateToken(user);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "token", token,
                            "user", Map.of("id", user.getId(), "username", user.getUsername(), "email", user.getEmail())
                    ));
                })
                .orElseGet(() -> {
                    auditLogService.log(request.login() != null ? request.login() : "unknown", LOGIN_FAILURE, null, null, null, ip, userAgent);
                    return ResponseEntity.status(401).body(Map.of(
                            "success", false,
                            "message", "Username/email o password non validi."
                    ));
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal String username, HttpServletRequest httpRequest) {
        if (username != null && !username.isBlank()) {
            authService.revokeTokens(username);
            auditLogService.log(username, "LOGOUT", null, null, null, resolveIp(httpRequest), httpRequest.getHeader("User-Agent"));
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Logout effettuato."));
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : null;
    }

    /** login: username oppure email dell'admin */
    public record LoginRequest(@NotBlank String login, @NotBlank String password) {}
}
