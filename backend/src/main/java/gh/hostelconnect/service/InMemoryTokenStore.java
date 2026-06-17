package gh.hostelconnect.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * In-memory store for OTP and lockout when Redis is not available (e.g. local
 * dev without Docker).
 * Not suitable for production (no TTL enforcement across restarts,
 * single-instance only).
 */
@Component
@ConditionalOnMissingBean(StringRedisTemplate.class)
public class InMemoryTokenStore implements TokenStore {

    private final Map<String, String> store = new ConcurrentHashMap<>();

    @Override
    public void set(String key, String value, int ttlMinutes) {
        store.put(key, value);
        // No TTL in this simple impl - entries stay until deleted or app restart
    }

    @Override
    public String get(String key) {
        return store.get(key);
    }

    @Override
    public void delete(String key) {
        store.remove(key);
    }

    @Override
    public long increment(String key) {
        String v = store.get(key);
        int n = v == null ? 0 : Integer.parseInt(v);
        n++;
        store.put(key, String.valueOf(n));
        return n;
    }

    @Override
    public void expire(String key, int minutes) {
        // No-op for in-memory; key remains until deleted
    }

    @Override
    public boolean hasKey(String key) {
        return store.containsKey(key);
    }
}
