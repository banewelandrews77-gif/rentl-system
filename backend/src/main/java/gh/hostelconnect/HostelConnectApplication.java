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
            String jdbcUrl = convertDatabaseUrl(dbUrl);
            System.setProperty("spring.datasource.url", jdbcUrl);
            
            // Log masked URL for debugging
            String masked = jdbcUrl.replaceAll("password=[^&]+", "password=****");
            System.out.println("[STARTUP] Formatted JDBC URL set to: " + masked);
        } else {
            System.out.println("[STARTUP] DATABASE_URL env var is NOT SET. Using application defaults.");
        }
        SpringApplication.run(HostelConnectApplication.class, args);
    }

    private static String convertDatabaseUrl(String dbUrl) {
        try {
            String cleanUrl = dbUrl;
            if (cleanUrl.startsWith("postgres://")) {
                cleanUrl = cleanUrl.replace("postgres://", "postgresql://");
            }
            java.net.URI uri = new java.net.URI(cleanUrl);
            String userInfo = uri.getUserInfo();
            String host = uri.getHost();
            int port = uri.getPort();
            if (port == -1) {
                port = 5432;
            }
            String path = uri.getPath();
            
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
            
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                String username = parts[0];
                String password = parts[1];
                jdbcUrl += "?user=" + username + "&password=" + password;
                jdbcUrl += "&sslmode=require";
            } else if (userInfo != null) {
                jdbcUrl += "?user=" + userInfo;
                jdbcUrl += "&sslmode=require";
            }
            
            return jdbcUrl;
        } catch (Exception e) {
            System.err.println("[STARTUP] Failed to parse DATABASE_URL URI: " + e.getMessage());
            if (dbUrl.startsWith("postgres://")) {
                return dbUrl.replace("postgres://", "jdbc:postgresql://") + "?sslmode=require";
            } else if (dbUrl.startsWith("postgresql://")) {
                return dbUrl.replace("postgresql://", "jdbc:postgresql://") + "?sslmode=require";
            }
            return dbUrl;
        }
    }
}
