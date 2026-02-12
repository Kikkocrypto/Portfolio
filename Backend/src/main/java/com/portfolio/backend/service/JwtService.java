package com.portfolio.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String CLAIM_TOKEN_VERSION = "tv";

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username, int tokenVersion) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(username)
                .claim(CLAIM_TOKEN_VERSION, tokenVersion)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

// si occupa di estrarre il username dal token JWT e di restituirlo come stringa
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public int extractTokenVersion(String token) {
        Object tv = getClaims(token).get(CLAIM_TOKEN_VERSION);
        if (tv instanceof Number) {
            return ((Number) tv).intValue();
        }
        return -1;
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, String username, int expectedTokenVersion) {
        try {
            String extracted = extractUsername(token);
            int version = extractTokenVersion(token);
            return extracted.equals(username) && version == expectedTokenVersion;
        } catch (Exception e) {
            return false;
        }
    }
}
