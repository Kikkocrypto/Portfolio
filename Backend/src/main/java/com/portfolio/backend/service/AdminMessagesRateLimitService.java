package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory sliding-window rate limiter for GET /api/admin/messages.
 * Limits requests per client key (username when authenticated, IP otherwise).
 * Default: 10 requests per 60 seconds per client.
 */
@Service
public class AdminMessagesRateLimitService {

    private final int maxRequests;
    private final long windowSeconds;
    private final Map<String, List<Instant>> requestsByKey = new ConcurrentHashMap<>();

    public AdminMessagesRateLimitService(
            @Value("${app.admin-messages-rate-limit.max-requests:10}") int maxRequests,
            @Value("${app.admin-messages-rate-limit.window-seconds:60}") long windowSeconds) {
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    /**
     * Attempts to consume one request for the given client key.
     *
     * @param key client identifier (e.g. username or IP)
     * @return true if the request is allowed, false if the limit is exceeded (caller should return 429)
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
