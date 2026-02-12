package com.portfolio.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.backend.controller.dto.ApiError;
import com.portfolio.backend.config.security.AdminLoginRateLimitFilter;
import com.portfolio.backend.config.security.AdminMessagesRateLimitFilter;
import com.portfolio.backend.config.security.ContactRateLimitFilter;
import com.portfolio.backend.config.security.JwtAuthenticationFilter;
import com.portfolio.backend.config.security.PublicPostRateLimitFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ContactRateLimitFilter contactRateLimitFilter;
    private final PublicPostRateLimitFilter publicPostRateLimitFilter;
    private final AdminLoginRateLimitFilter adminLoginRateLimitFilter;
    private final AdminMessagesRateLimitFilter adminMessagesRateLimitFilter;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          ContactRateLimitFilter contactRateLimitFilter,
                          PublicPostRateLimitFilter publicPostRateLimitFilter,
                          AdminLoginRateLimitFilter adminLoginRateLimitFilter,
                          AdminMessagesRateLimitFilter adminMessagesRateLimitFilter,
                          ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.contactRateLimitFilter = contactRateLimitFilter;
        this.publicPostRateLimitFilter = publicPostRateLimitFilter;
        this.adminLoginRateLimitFilter = adminLoginRateLimitFilter;
        this.adminMessagesRateLimitFilter = adminMessagesRateLimitFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            ApiError apiError = new ApiError(HttpStatus.UNAUTHORIZED.value(),
                                    "Accesso non autorizzato. Token mancante o non valido.");
                            res.setStatus(HttpStatus.UNAUTHORIZED.value());
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            res.getWriter().write(objectMapper.writeValueAsString(apiError));
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            ApiError apiError = new ApiError(HttpStatus.FORBIDDEN.value(),
                                    "Accesso negato. Non hai i permessi per questa risorsa.");
                            res.setStatus(HttpStatus.FORBIDDEN.value());
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            res.getWriter().write(objectMapper.writeValueAsString(apiError));
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/contacts").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/auth/password-reset-email").permitAll()
                        .requestMatchers("/api/admin/auth/password-reset").permitAll()
                        .requestMatchers("/api/posts", "/api/posts/**").permitAll()
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(publicPostRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(contactRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(adminLoginRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(adminMessagesRateLimitFilter, JwtAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }
}
