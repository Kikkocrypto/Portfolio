package com.portfolio.backend.repository;

import com.portfolio.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    /**
     * Trova un token valido per stringa token.
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Trova tutti i token (usati o non) per un dato utente.
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.adminUserId = :userId")
    java.util.List<PasswordResetToken> findByAdminUserId(@Param("userId") String userId);

    /**
     * Invalida (marca come used) tutti i token precedenti di un utente.
     * Utilizzato quando un token viene usato con successo per evitare riutilizzo.
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.adminUserId = :userId AND t.used = false")
    void invalidateAllTokensForUser(@Param("userId") String userId);

    /**
     * Elimina token scaduti (pulizia periodica opzionale).
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") Instant now);
}
