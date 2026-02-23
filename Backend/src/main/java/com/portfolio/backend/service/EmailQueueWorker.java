package com.portfolio.backend.service;

import com.portfolio.backend.entity.Contact;
import com.portfolio.backend.entity.EmailJob;
import com.portfolio.backend.entity.EmailJobStatus;
import com.portfolio.backend.entity.EmailJobType;
import com.portfolio.backend.repository.ContactRepository;
import com.portfolio.backend.repository.EmailJobRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmailQueueWorker {

    private static final Logger log = LoggerFactory.getLogger(EmailQueueWorker.class);

    private final EmailJobRepository emailJobRepository;
    private final ContactRepository contactRepository;
    private final ContactMailService contactMailService;

    private final int batchSize;
    private final int maxAttempts;
    private final long staleLockMs;

    public EmailQueueWorker(
            EmailJobRepository emailJobRepository,
            ContactRepository contactRepository,
            ContactMailService contactMailService,
            @Value("${app.email-queue.batch-size:10}") int batchSize,
            @Value("${app.email-queue.max-attempts:8}") int maxAttempts,
            @Value("${app.email-queue.stale-lock-ms:300000}") long staleLockMs
    ) {
        this.emailJobRepository = emailJobRepository;
        this.contactRepository = contactRepository;
        this.contactMailService = contactMailService;
        this.batchSize = Math.max(1, batchSize);
        this.maxAttempts = Math.max(1, maxAttempts);
        this.staleLockMs = Math.max(10_000L, staleLockMs);
    }

    @Scheduled(fixedDelayString = "${app.email-queue.poll-ms:5000}")
    public void tick() {
        long now = System.currentTimeMillis();

        int released = releaseStale(now);
        if (released > 0) {
            log.warn("EmailQueue: released {} stale locks", released);
        }

        List<EmailJob> claimed = claimDueJobs(now);
        if (claimed.isEmpty()) {
            return;
        }

        for (EmailJob job : claimed) {
            processOne(job);
        }
    }

    @Transactional
    protected int releaseStale(long nowMs) {
        long staleBefore = nowMs - staleLockMs;
        List<EmailJob> stale = emailJobRepository.findByStatusAndLockedAtMsLessThan(
                EmailJobStatus.IN_PROGRESS,
                staleBefore
        );
        if (stale.isEmpty()) {
            return 0;
        }
        for (EmailJob j : stale) {
            j.setStatus(EmailJobStatus.PENDING);
            j.setLockedAtMs(null);
        }
        emailJobRepository.saveAll(stale);
        return stale.size();
    }

    @Transactional
    protected List<EmailJob> claimDueJobs(long nowMs) {
        List<EmailJob> jobs = emailJobRepository
                .findByStatusAndNextAttemptAtMsLessThanEqualOrderByCreatedAtMsAsc(
                        EmailJobStatus.PENDING,
                        nowMs,
                        PageRequest.of(0, batchSize)
                )
                .getContent();

        if (jobs.isEmpty()) {
            return jobs;
        }

        for (EmailJob j : jobs) {
            j.setStatus(EmailJobStatus.IN_PROGRESS);
            j.setLockedAtMs(nowMs);
        }
        emailJobRepository.saveAll(jobs);
        return jobs;
    }

    protected void processOne(EmailJob job) {
        long startMs = System.currentTimeMillis();
        try {
            if (job.getContactId() == null || job.getContactId().isBlank()) {
                failPermanently(job, "Missing contactId");
                return;
            }
            Contact contact = contactRepository.findById(job.getContactId()).orElse(null);
            if (contact == null) {
                failPermanently(job, "Contact not found");
                return;
            }

            boolean sent;
            if (job.getType() == EmailJobType.CONTACT_NOTIFY_OWNER) {
                sent = contactMailService.sendOwnerNotification(contact);
            } else if (job.getType() == EmailJobType.CONTACT_REPLY_SENDER) {
                sent = contactMailService.sendAutoReply(contact);
            } else {
                failPermanently(job, "Unsupported type: " + job.getType());
                return;
            }

            long duration = System.currentTimeMillis() - startMs;
            if (sent) {
                markSent(job, duration);
            } else {
                retryOrFail(job, duration, "Send returned false");
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startMs;
            retryOrFail(job, duration, e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    @Transactional
    protected void markSent(EmailJob job, long durationMs) {
        EmailJob fresh = emailJobRepository.findById(job.getId()).orElse(job);
        fresh.setStatus(EmailJobStatus.SENT);
        fresh.setLockedAtMs(null);
        fresh.setLastError(null);
        emailJobRepository.save(fresh);
            log.info("EmailQueue: job sent type={} in {}ms", fresh.getType(), durationMs);
    }

    @Transactional
    protected void retryOrFail(EmailJob job, long durationMs, String error) {
        EmailJob fresh = emailJobRepository.findById(job.getId()).orElse(job);
        int attempts = fresh.getAttempts() + 1;
        fresh.setAttempts(attempts);
        fresh.setLockedAtMs(null);
        fresh.setLastError(trim(error, 2000));

        if (attempts >= maxAttempts) {
            fresh.setStatus(EmailJobStatus.FAILED);
            emailJobRepository.save(fresh);
            log.error("EmailQueue: job failed permanently type={} attempts={} lastError={}", fresh.getType(), attempts, fresh.getLastError());
            return;
        }

        long backoffMs = computeBackoffMs(attempts);
        fresh.setStatus(EmailJobStatus.PENDING);
        fresh.setNextAttemptAtMs(System.currentTimeMillis() + backoffMs);
        emailJobRepository.save(fresh);
        log.warn("EmailQueue: job retry scheduled id={} type={} attempt={} in {}ms (last duration {}ms)", fresh.getId(), fresh.getType(), attempts, backoffMs, durationMs);
    }

    @Transactional
    protected void failPermanently(EmailJob job, String error) {
        EmailJob fresh = emailJobRepository.findById(job.getId()).orElse(job);
        fresh.setStatus(EmailJobStatus.FAILED);
        fresh.setLockedAtMs(null);
        fresh.setAttempts(Math.max(fresh.getAttempts(), maxAttempts));
        fresh.setLastError(trim(error, 2000));
        emailJobRepository.save(fresh);
        log.error("EmailQueue: job failed permanently type={} reason={}", fresh.getType(), fresh.getLastError());
    }

    private long computeBackoffMs(int attempt) {
        // Exponential backoff: 1s, 2s, 4s, ... capped at 10 minutes
        long base = 1000L;
        long max = 10 * 60 * 1000L;
        long value = base * (1L << Math.min(20, Math.max(0, attempt - 1)));
        return Math.min(max, value);
    }

    private static String trim(String value, int maxLen) {
        if (value == null) return null;
        if (value.length() <= maxLen) return value;
        return value.substring(0, maxLen);
    }
}

