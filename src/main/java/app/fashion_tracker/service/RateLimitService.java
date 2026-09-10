package app.fashion_tracker.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter. Fine for a single-instance deployment;
 * if this app ever runs multiple backend instances behind a load
 * balancer, this would need to move to a shared store (e.g. Redis)
 * since each instance would otherwise track attempts independently.
 */
@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Deque<Instant>> attempts =
            new ConcurrentHashMap<>();

    public boolean isAllowed(String key, int maxAttempts, Duration window) {
        Instant now = Instant.now();

        Deque<Instant> timestamps = attempts.computeIfAbsent(
                key, k -> new ArrayDeque<>()
        );

        synchronized (timestamps) {
            while (!timestamps.isEmpty() &&
                    Duration.between(timestamps.peekFirst(), now).compareTo(window) > 0) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxAttempts) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}