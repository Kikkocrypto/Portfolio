package com.portfolio.backend.repository;

import com.portfolio.backend.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String>, JpaSpecificationExecutor<AuditLog> {

    /**
     * Tutti i log ordinati per data decrescente (più recenti per primi).
     */
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Returns only IDs of audit logs with {@code createdAt} strictly before the given cutoff.
     * Used for batch deletion without loading full entities.
     *
     * @param cutoff upper bound (exclusive) for {@code createdAt}
     * @param pageable page and size for batching (e.g. size 500)
     * @return page of audit log IDs to delete
     */
    @Query("SELECT a.id FROM AuditLog a WHERE a.createdAt < :cutoff")
    Page<String> findIdsByCreatedAtBefore(@Param("cutoff") Instant cutoff, Pageable pageable);

    /**
     * Hard delete all audit logs with {@code createdAt} strictly before the given cutoff.
     * Single bulk DELETE query; use for smaller datasets or when batching is not needed.
     *
     * @param cutoff upper bound (exclusive) for {@code createdAt}
     * @return number of rows deleted
     */
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") Instant cutoff);
}
