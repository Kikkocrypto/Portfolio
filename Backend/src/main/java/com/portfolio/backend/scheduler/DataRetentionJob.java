package com.portfolio.backend.scheduler;

import com.portfolio.backend.service.DataRetentionScheduleHolder;
import com.portfolio.backend.service.DataRetentionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Job schedulato che esegue la cancellazione automatica (hard delete) dei dati oltre il periodo
 * di retention: contact messages e audit logs con {@code createdAt} più vecchio di N giorni.
 * <p>
 * Unica variabile: {@code app.data-retention.retention-days} (default 90).
 * Frequenza: {@code app.data-retention.cron} (default ogni giorno alle 02:00).
 * Ogni run è thread-safe: un solo esecutore alla volta grazie al lock interno.
 */
@Component
public class DataRetentionJob {

    private static final Logger log = LoggerFactory.getLogger(DataRetentionJob.class);

    private final DataRetentionService dataRetentionService;
    private final DataRetentionScheduleHolder scheduleHolder;

    /**
     * Retention in giorni: record con {@code createdAt} più vecchio vengono eliminati.
     * Default 90 giorni.
     */
    @Value("${app.data-retention.retention-days:90}")
    private int retentionDays;

    /** Lock per evitare esecuzioni concorrenti (thread-safe). */
    private final AtomicBoolean running = new AtomicBoolean(false);

    public DataRetentionJob(DataRetentionService dataRetentionService,
                            DataRetentionScheduleHolder scheduleHolder) {
        this.dataRetentionService = dataRetentionService;
        this.scheduleHolder = scheduleHolder;
    }

    /**
     * Esegue la pulizia dei contact e degli audit log più vecchi di {@code retention-days}.
     * Frequenza: configurabile con {@code app.data-retention.cron} (default: ogni giorno alle 02:00).
     */
    @Scheduled(cron = "${app.data-retention.cron:0 0 2 * * ?}")
    public void run() {
        if (!running.compareAndSet(false, true)) {
            log.warn("Data retention job skipped: previous run still in progress");
            return;
        }
        try {
            Instant cutoff = Instant.now().minusSeconds((long) retentionDays * 24 * 60 * 60);
            log.info("Data retention job started: deleting records older than {} day(s) (cutoff {})", retentionDays, cutoff);

            int totalContacts = deleteContactsInBatches(cutoff);
            int totalAuditLogs = deleteAuditLogsInBatches(cutoff);

            log.info("Data retention job completed: deleted {} contact(s), {} audit log(s)",
                    totalContacts, totalAuditLogs);
        } catch (Exception e) {
            log.error("Data retention job failed", e);
        } finally {
            running.set(false);
            scheduleHolder.updateNextRun(Instant.now());
        }
    }

    /**
     * Elimina i contact con createdAt &lt; cutoff in batch fino a esaurimento.
     *
     * @param cutoff data di cutoff (esclusiva)
     * @return numero totale di contact eliminati
     */
    private int deleteContactsInBatches(Instant cutoff) {
        // Usa bulk delete: una sola query elimina tutti i record
        int deleted = dataRetentionService.deleteContactsOlderThanBatch(cutoff);
        if (deleted > 0) {
            log.debug("Data retention: deleted {} contact(s)", deleted);
        }
        return deleted;
    }

    /**
     * Elimina gli audit log con createdAt &lt; cutoff in batch fino a esaurimento.
     *
     * @param cutoff data di cutoff (esclusiva)
     * @return numero totale di audit log eliminati
     */
    private int deleteAuditLogsInBatches(Instant cutoff) {
        // Usa bulk delete: una sola query elimina tutti i record
        int deleted = dataRetentionService.deleteAuditLogsOlderThanBatch(cutoff);
        if (deleted > 0) {
            log.debug("Data retention: deleted {} audit log(s)", deleted);
        }
        return deleted;
    }
}
