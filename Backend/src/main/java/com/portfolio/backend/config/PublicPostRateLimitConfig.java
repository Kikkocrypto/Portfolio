package com.portfolio.backend.config;

import com.portfolio.backend.config.security.PublicPostRateLimitFilter;
import com.portfolio.backend.service.AuditLogService;
import com.portfolio.backend.service.PublicPostRateLimitService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PublicPostRateLimitConfig {

    @Bean
    public PublicPostRateLimitFilter publicPostRateLimitFilter(PublicPostRateLimitService rateLimitService,
                                                              AuditLogService auditLogService) {
        return new PublicPostRateLimitFilter(rateLimitService, auditLogService);
    }
}
