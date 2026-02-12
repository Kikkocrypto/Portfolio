package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface ContactRepository extends JpaRepository<Contact, String> {

    /**
     * All contacts ordered by createdAt descending (newest first).
     */
    Page<Contact> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Returns only IDs of contacts with {@code createdAt} strictly before the given cutoff.
     * Used for batch deletion without loading full entities.
     *
     * @param cutoff upper bound (exclusive) for {@code createdAt}
     * @param pageable page and size for batching (e.g. size 500)
     * @return page of contact IDs to delete
     */
    @Query("SELECT c.id FROM Contact c WHERE c.createdAt < :cutoff")
    Page<String> findIdsByCreatedAtBefore(@Param("cutoff") Instant cutoff, Pageable pageable);

    /**
     * Hard delete all contacts with {@code createdAt} strictly before the given cutoff.
     * Single bulk DELETE query; use for smaller datasets or when batching is not needed.
     *
     * @param cutoff upper bound (exclusive) for {@code createdAt}
     * @return number of rows deleted
     */
    @Modifying
    @Query("DELETE FROM Contact c WHERE c.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") Instant cutoff);
}
