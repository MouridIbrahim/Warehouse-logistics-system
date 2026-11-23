package com.logistics.warehouse_system.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Sliding-window rate limiter for authentication endpoints (login/register).
 * Uses Redis for distributed rate limiting across multiple backend instances,
 * falling back to in-memory tracking if Redis is unavailable.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private static final String REGISTER_PATH = "/api/v1/auth/register";

    private final StringRedisTemplate redisTemplate;
    private final boolean enabled;
    private final int maxRequests;
    private final long windowSeconds;

    // In-memory fallback (used when Redis is unavailable)
    private final java.util.Map<String, java.util.Deque<Long>> requestTimestamps =
            new java.util.concurrent.ConcurrentHashMap<>();

    public RateLimitFilter(StringRedisTemplate redisTemplate,
                           @Value("${app.rate-limit.enabled:true}") boolean enabled,
                           @Value("${app.rate-limit.max-requests:10}") int maxRequests,
                           @Value("${app.rate-limit.window-seconds:60}") long windowSeconds) {
        this.redisTemplate = redisTemplate;
        this.enabled = enabled;
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        String path = request.getRequestURI();
        return !(LOGIN_PATH.equals(path) || REGISTER_PATH.equals(path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = clientIp(request);

        boolean allowed;
        if (redisTemplate != null) {
            allowed = isAllowedRedis(ip);
        } else {
            allowed = isAllowedMemory(ip);
        }

        if (!allowed) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"code\":\"RATE_LIMITED\","
                            + "\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowedRedis(String ip) {
        try {
            String key = "ratelimit:" + ip;
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == 1) {
                redisTemplate.expire(key, java.time.Duration.ofSeconds(windowSeconds / 1000));
            }
            return count <= maxRequests;
        } catch (Exception e) {
            // Redis unavailable, fall back to in-memory
            return isAllowedMemory(ip);
        }
    }

    private boolean isAllowedMemory(String ip) {
        long now = System.currentTimeMillis();
        java.util.Deque<Long> timestamps = requestTimestamps.computeIfAbsent(ip,
                k -> new java.util.concurrent.ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMillis()) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxRequests) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }

    private long windowMillis() {
        return windowSeconds * 1000;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Scheduled(fixedDelay = 3_600_000, initialDelay = 3_600_000)
    public void cleanupStaleEntries() {
        long now = System.currentTimeMillis();
        requestTimestamps.entrySet().removeIf(entry -> {
            java.util.Deque<Long> deque = entry.getValue();
            synchronized (deque) {
                while (!deque.isEmpty() && now - deque.peekFirst() > windowMillis()) {
                    deque.pollFirst();
                }
                return deque.isEmpty();
            }
        });
    }
}
