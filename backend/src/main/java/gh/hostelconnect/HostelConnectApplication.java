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
                cleanUrl = cleanUrl.substring("postgres://".length());
            } else if (cleanUrl.startsWith("postgresql://")) {
                cleanUrl = cleanUrl.substring("postgresql://".length());
            }
            
            // Find the last '@' which separates credentials from host
            int lastAtIndex = cleanUrl.lastIndexOf('@');
            if (lastAtIndex == -1) {
                throw new IllegalArgumentException("Invalid connection URI: missing '@'");
            }
            
            String credentials = cleanUrl.substring(0, lastAtIndex);
            String hostAndDb = cleanUrl.substring(lastAtIndex + 1);
            
            // Parse credentials (username:password)
            String username = credentials;
            String password = "";
            int firstColonIndex = credentials.indexOf(':');
            if (firstColonIndex != -1) {
                username = credentials.substring(0, firstColonIndex);
                password = credentials.substring(firstColonIndex + 1);
            }
            
            // Parse host and database
            String hostPort = hostAndDb;
            String database = "";
            int firstSlashIndex = hostAndDb.indexOf('/');
            if (firstSlashIndex != -1) {
                hostPort = hostAndDb.substring(0, firstSlashIndex);
                database = hostAndDb.substring(firstSlashIndex + 1);
            }
            
            // Parse port if specified
            String host = hostPort;
            String port = "5432";
            int lastColonIndex = hostPort.lastIndexOf(':');
            if (lastColonIndex != -1) {
                host = hostPort.substring(0, lastColonIndex);
                port = hostPort.substring(lastColonIndex + 1);
            }
            
            // Remove query params from database name if present
            if (database.contains("?")) {
                database = database.substring(0, database.indexOf('?'));
            }
            
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            jdbcUrl += "?user=" + username + "&password=" + password;
            jdbcUrl += "&sslmode=require";
            
            return jdbcUrl;
        } catch (Exception e) {
            System.err.println("[STARTUP] Failed to parse DATABASE_URL: " + e.getMessage());
            return dbUrl;
        }
    }
}
