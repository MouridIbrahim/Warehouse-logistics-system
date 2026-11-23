package com.logistics.warehouse_system.security;

import com.logistics.warehouse_system.security.RateLimitFilter;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Distributed rate limiter backed by Redis.
 * Uses INCR with TTL for atomic, cluster-safe rate limiting across multiple backend instances.
 */
@Service
public class RedisRateLimitService {

    private static final int WINDOW_SECONDS = 60;
    private static final int MAX_REQUESTS = 10;

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Checks and increments the request count for the given client IP.
     * Returns true if the request is allowed, false if rate limit is exceeded.
     */
    public boolean isAllowed(String ip) {
        String key = "ratelimit:" + ip;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
        }
        return count <= MAX_REQUESTS;
    }

    public void reset(String ip) {
        redisTemplate.delete("ratelimit:" + ip);
    }
}
