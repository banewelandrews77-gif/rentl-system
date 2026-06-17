package gh.hostelconnect.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component("redisTokenStore")
@ConditionalOnBean(StringRedisTemplate.class)
public class RedisTokenStore implements TokenStore {

    private final StringRedisTemplate redis;

    public RedisTokenStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    public void set(String key, String value, int ttlMinutes) {
        redis.opsForValue().set(key, value, ttlMinutes, TimeUnit.MINUTES);
    }

    @Override
    public String get(String key) {
        return redis.opsForValue().get(key);
    }

    @Override
    public void delete(String key) {
        redis.delete(key);
    }

    @Override
    public long increment(String key) {
        Long n = redis.opsForValue().increment(key);
        return n == null ? 0 : n;
    }

    @Override
    public void expire(String key, int minutes) {
        redis.expire(key, minutes, TimeUnit.MINUTES);
    }

    @Override
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redis.hasKey(key));
    }
}
