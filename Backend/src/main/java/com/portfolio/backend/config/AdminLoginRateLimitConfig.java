package com.portfolio.backend.config;

import com.portfolio.backend.config.security.AdminLoginRateLimitFilter;
import com.portfolio.backend.service.AdminLoginRateLimitService;
import com.portfolio.backend.service.AuditLogService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminLoginRateLimitConfig {

    @Bean
    public AdminLoginRateLimitFilter adminLoginRateLimitFilter(
            AdminLoginRateLimitService rateLimitService,
            AuditLogService auditLogService) {
        return new AdminLoginRateLimitFilter(rateLimitService, auditLogService);
    }
}
