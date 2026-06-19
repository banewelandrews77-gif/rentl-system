package gh.hostelconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HostelConnectApplication {

    public static void main(String[] args) {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl != null) {
            String masked = dbUrl.replaceAll(":[^:@]+@", ":****@");
            System.out.println("[STARTUP] DATABASE_URL env var is: " + masked);
        } else {
            System.out.println("[STARTUP] DATABASE_URL env var is NOT SET.");
        }
        SpringApplication.run(HostelConnectApplication.class, args);
    }
}
