package com.portfolio.backend.service;

import com.portfolio.backend.entity.AdminUser;
import com.portfolio.backend.repository.AdminUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AdminUserRepository adminUserRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Optional<AdminUser> findByUsername(String username) {
        return adminUserRepository.findByUsername(username);
    }

    public Optional<AdminUser> findByUsernameOrEmail(String login) {
        return adminUserRepository.findByUsernameOrEmail(login);
    }

    public boolean validatePassword(AdminUser user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public String generateToken(AdminUser user) {
        return jwtService.generateToken(user.getUsername(), user.getTokenVersion());
    }

    /**
     * Verifica che il token non sia revocato (tokenVersion nel JWT corrisponde a quello nel DB).
     * Token senza claim tv (emessi prima dell'upgrade) sono trattati come version 0.
     */
    public boolean isTokenValid(String username, int tokenVersion) {
        int effectiveVersion = tokenVersion < 0 ? 0 : tokenVersion;
        return adminUserRepository.findByUsername(username)
                .map(u -> u.getTokenVersion() == effectiveVersion)
                .orElse(false);
    }

    /**
     * Incrementa token_version dell'utente, invalidando tutti i JWT emessi prima di ora.
     * Usa query nativa per evitare load/save entity (id UUID corrotto con SQLite).
     * @Transactional richiesto per le query @Modifying.
     */
    @Transactional
    public void revokeTokens(String username) {
        if (username == null || username.isBlank()) {
            return;
        }
        adminUserRepository.incrementTokenVersionByUsername(username);
    }

    /**
     * Returns authorities for an admin user (used by JWT filter for method-level security).
     * Only users present in admin_users are granted ROLE_ADMIN.
     */
    public List<GrantedAuthority> getAuthoritiesForAdmin(String username) {
        if (username == null || username.isBlank()) {
            return Collections.emptyList();
        }
        return adminUserRepository.findByUsername(username)
                .map(u -> List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .orElse(Collections.emptyList());
    }
}
