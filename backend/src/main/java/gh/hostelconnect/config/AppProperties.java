package gh.hostelconnect.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Otp otp = new Otp();
    private Lockout lockout = new Lockout();
    private Admin admin = new Admin();
    private String frontendUrl = "http://localhost:3000";

    @Getter
    @Setter
    public static class Admin {
        private String email = "banewelandrews77@gmail.com";
        private String password = "Hostelconnect@1";
    }

    @Getter
    @Setter
    public static class Jwt {
        private String secret = "your-256-bit-secret-change-in-production-min-32-chars";
        private long expirationMs = 86400000L;
        private String issuer = "hostelconnect-gh";
    }

    @Getter
    @Setter
    public static class Otp {
        private int ttlMinutes = 15;
        private int length = 6;
    }

    @Getter
    @Setter
    public static class Lockout {
        private int maxAttempts = 5;
        private int lockoutMinutes = 15;
    }
}
