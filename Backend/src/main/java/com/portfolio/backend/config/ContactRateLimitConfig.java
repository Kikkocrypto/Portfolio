package com.portfolio.backend.config;

import com.portfolio.backend.config.security.ContactRateLimitFilter;
import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.ContactRateLimitService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ContactRateLimitConfig {

    @Bean
    public ContactRateLimitFilter contactRateLimitFilter(ContactRateLimitService rateLimitService,
                                                         AuditLogService auditLogService) {
        return new ContactRateLimitFilter(rateLimitService, auditLogService);
    }
}
