package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Rate limiter in-memory a finestra scorrevole per IP.
 * Limita il numero di richieste per chiave (es. IP) in un intervallo di tempo.
 */
@Service
public class ContactRateLimitService {

    private final int maxRequests;
    private final long windowSeconds;
    private final Map<String, List<Instant>> requestsByKey = new ConcurrentHashMap<>();

    public ContactRateLimitService(
            @Value("${app.contact-rate-limit.max-requests:5}") int maxRequests,
            @Value("${app.contact-rate-limit.window-seconds:60}") long windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    /**
     *
     * @param key identificativo (es. indirizzo IP)
     * @return true se la richiesta è consentita, false se il limite è superato (429)
     */
    public boolean tryAcquire(String key) {
        Instant now = Instant.now();
        Instant cutoff = now.minusSeconds(windowSeconds);

        List<Instant> timestamps = requestsByKey.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>());

        synchronized (timestamps) {
            timestamps.removeIf(t -> t.isBefore(cutoff));
            if (timestamps.size() >= maxRequests) {
                return false;
            }
            timestamps.add(now);
            return true;
        }
    }
}
