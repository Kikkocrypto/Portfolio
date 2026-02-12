package com.portfolio.backend.repository;

import com.portfolio.backend.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    Optional<AdminUser> findByUsername(String username);

    Optional<AdminUser> findByEmail(String email);

    @Query("SELECT u FROM AdminUser u WHERE u.username = :login OR u.email = :login")
    Optional<AdminUser> findByUsernameOrEmail(@Param("login") String login);

    /**
     * Restituisce l'id dell'admin come stringa letta direttamente dal DB.
     * Evita corruzione da converter UUID con SQLite (hex encoding).
     */
    @Query(value = "SELECT id FROM admin_users WHERE email = :email", nativeQuery = true)
    Optional<String> findIdByEmailNative(@Param("email") String email);

    /**
     * Restituisce l'email dell'admin dato l'id (query nativa, evita problemi UUID con SQLite).
     */
    @Query(value = "SELECT email FROM admin_users WHERE id = :id", nativeQuery = true)
    Optional<String> findEmailByIdNative(@Param("id") String id);

    /**
     * Restituisce lo username dell'admin dato l'id (query nativa).
     */
    @Query(value = "SELECT username FROM admin_users WHERE id = :id", nativeQuery = true)
    Optional<String> findUsernameByIdNative(@Param("id") String id);

    /**
     * Aggiorna password e incrementa token_version per logout globale (query nativa).
     * Evita di usare l'entity AdminUser e il suo id (corrotto con SQLite).
     */
    @Modifying
    @Query(value = "UPDATE admin_users SET password_hash = :passwordHash, token_version = token_version + 1 WHERE id = :id", nativeQuery = true)
    int updatePasswordAndRevokeTokensById(@Param("id") String id, @Param("passwordHash") String passwordHash);

    /**
     * Incrementa token_version per username (query nativa, evita load/save entity con id corrotto).
     * Usato per logout e revoca JWT.
     */
    @Modifying
    @Query(value = "UPDATE admin_users SET token_version = token_version + 1 WHERE username = :username", nativeQuery = true)
    int incrementTokenVersionByUsername(@Param("username") String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
