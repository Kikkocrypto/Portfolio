package com.portfolio.backend.config;

import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

/**
 * Condizione: true se {@code app.resend.api-key} è impostata e non vuota.
 */
public class OnResendApiKeyPresentCondition implements org.springframework.context.annotation.Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String apiKey = context.getEnvironment().getProperty("app.resend.api-key", "");
        return StringUtils.hasText(apiKey);
    }
}
