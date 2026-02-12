package com.portfolio.backend.config;

import com.portfolio.backend.config.security.AdminMessagesRateLimitFilter;
import com.portfolio.backend.service.AdminMessagesRateLimitService;
import com.portfolio.backend.service.AuditLogService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminMessagesRateLimitConfig {

    @Bean
    public AdminMessagesRateLimitFilter adminMessagesRateLimitFilter(
            AdminMessagesRateLimitService rateLimitService,
            AuditLogService auditLogService) {
        return new AdminMessagesRateLimitFilter(rateLimitService, auditLogService);
    }
}
