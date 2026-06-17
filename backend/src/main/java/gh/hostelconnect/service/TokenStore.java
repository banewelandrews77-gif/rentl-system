package gh.hostelconnect.service;

/**
 * Key-value store for OTP and lockout data. Backed by Redis in production or in-memory when Redis is not available.
 */
public interface TokenStore {

    void set(String key, String value, int ttlMinutes);

    String get(String key);

    void delete(String key);

    long increment(String key);

    void expire(String key, int minutes);

    boolean hasKey(String key);
}
