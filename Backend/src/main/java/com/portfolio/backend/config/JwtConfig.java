package com.portfolio.backend.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configurazione JWT: secret e expiration sono letti da application.yml
 * (jwt.secret, jwt.expiration-ms) e usati da JwtService.
 */
@Configuration
public class JwtConfig {
}
