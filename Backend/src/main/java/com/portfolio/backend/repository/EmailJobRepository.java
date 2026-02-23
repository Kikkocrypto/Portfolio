package com.portfolio.backend.repository;

import com.portfolio.backend.entity.EmailJob;
import com.portfolio.backend.entity.EmailJobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailJobRepository extends JpaRepository<EmailJob, String> {

    Page<EmailJob> findByStatusAndNextAttemptAtMsLessThanEqualOrderByCreatedAtMsAsc(
            EmailJobStatus status,
            long nowMs,
            Pageable pageable
    );

    List<EmailJob> findByStatusAndLockedAtMsLessThan(
            EmailJobStatus status,
            long staleBeforeMs
    );
}

