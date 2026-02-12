package com.portfolio.backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting per gli endpoint di reset password.
 * 
 * Limiti:
 * - 3 richieste ogni 15 minuti per IP
 * 
 * SICUREZZA: Previene abuso del sistema di reset password
 * (es. enumeration di email, DoS, brute force su token).
 */
@Configuration
public class PasswordResetRateLimitConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new PasswordResetRateLimitInterceptor())
                .addPathPatterns("/api/admin/auth/password-reset-email", "/api/admin/auth/password-reset");
    }

    /**
     * Interceptor che implementa rate limiting basato su IP.
     */
    private static class PasswordResetRateLimitInterceptor implements HandlerInterceptor {

        // Cache di bucket per IP
        private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
                throws Exception {
            
            String ip = resolveIp(request);
            Bucket bucket = cache.computeIfAbsent(ip, k -> createBucket());

            if (bucket.tryConsume(1)) {
                return true; // consenti richiesta
            } else {
                // Rate limit superato
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"status\": 429, \"details\": \"Troppe richieste. Riprova più tardi.\"}"
                );
                return false; // blocca richiesta
            }
        }

        /**
         * Crea bucket con limite: 3 richieste ogni 15 minuti.
         */
        private Bucket createBucket() {
            Bandwidth limit = Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(15)));
            return Bucket.builder()
                    .addLimit(limit)
                    .build();
        }

        /**
         * Risolve IP reale considerando proxy.
         */
        private String resolveIp(HttpServletRequest request) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
        }
    }
}
