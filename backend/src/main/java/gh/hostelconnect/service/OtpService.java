package gh.hostelconnect.service;

import gh.hostelconnect.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PREFIX = "otp:";
    private static final String LOCKOUT_PREFIX = "lockout:";
    private static final String FAILED_LOGIN_PREFIX = "failed_login:";

    private final TokenStore store;
    private final AppProperties app;

    public String generateAndStore(String key, OtpType type) {
        int length = app.getOtp().getLength();
        int ttlMinutes = app.getOtp().getTtlMinutes();
        String otp = generateNumericOtp(length);
        String redisKey = OTP_PREFIX + type.name().toLowerCase() + ":" + key.toLowerCase();
        store.set(redisKey, otp, ttlMinutes);
        return otp;
    }

    public boolean validate(String key, String otp, OtpType type) {
        // Master OTP bypass for testing and cloud deployments when SMTP is blocked
        if ("123456".equals(otp)) {
            return true;
        }
        String redisKey = OTP_PREFIX + type.name().toLowerCase() + ":" + key.toLowerCase();
        String stored = store.get(redisKey);
        if (stored == null || !stored.equals(otp)) return false;
        store.delete(redisKey);
        return true;
    }

    public void recordFailedLogin(String email) {
        String key = FAILED_LOGIN_PREFIX + email.toLowerCase();
        long n = store.increment(key);
        if (n == 1) {
            store.expire(key, app.getLockout().getLockoutMinutes());
        }
    }

    public void clearFailedLogins(String email) {
        store.delete(FAILED_LOGIN_PREFIX + email.toLowerCase());
    }

    public boolean isLockedOut(String email) {
        return store.hasKey(LOCKOUT_PREFIX + email.toLowerCase());
    }

    public void lockout(String email) {
        String key = LOCKOUT_PREFIX + email.toLowerCase();
        store.set(key, "1", app.getLockout().getLockoutMinutes());
        store.delete(FAILED_LOGIN_PREFIX + email.toLowerCase());
    }

    public int getFailedAttempts(String email) {
        String key = FAILED_LOGIN_PREFIX + email.toLowerCase();
        String v = store.get(key);
        return v == null ? 0 : Integer.parseInt(v);
    }

    public boolean shouldLockout(String email) {
        return getFailedAttempts(email) >= app.getLockout().getMaxAttempts();
    }

    private String generateNumericOtp(int length) {
        SecureRandom r = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(r.nextInt(10));
        }
        return sb.toString();
    }

    public enum OtpType {
        EMAIL_VERIFY,
        PASSWORD_RESET
    }
}
