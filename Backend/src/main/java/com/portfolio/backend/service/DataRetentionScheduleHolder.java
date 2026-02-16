package com.portfolio.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.support.CronExpression;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Mantiene la data/ora della prossima esecuzione del job di data retention.
 * Aggiornato a ogni esecuzione del job e all'avvio dell'applicazione.
 */
@Component
public class DataRetentionScheduleHolder {

    private final AtomicReference<Instant> nextRun = new AtomicReference<>();

    @Value("${app.data-retention.cron:0 0 2 * * ?}")
    private String cronExpression;

    /**
     * Calcola e memorizza la prossima esecuzione a partire da {@code after}.
     * Chiamato dal job dopo ogni run e all'avvio.
     */
    public void updateNextRun(Instant after) {
        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            ZonedDateTime zdt = after.atZone(ZoneId.systemDefault());
            ZonedDateTime next = cron.next(zdt);
            if (next != null) {
                nextRun.set(next.toInstant());
            }
        } catch (Exception ignored) {
            // cron invalido o non parsabile: non aggiornare
        }
    }

    /**
     * Restituisce la prossima esecuzione programmata, o null se non ancora calcolata.
     */
    public Instant getNextRun() {
        return nextRun.get();
    }

    @PostConstruct
    void init() {
        updateNextRun(Instant.now());
    }
}
