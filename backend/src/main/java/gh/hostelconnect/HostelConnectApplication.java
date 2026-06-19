package gh.hostelconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HostelConnectApplication {

    private static String parsedHost = null;
    private static int parsedPort = 5432;

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
            parsedHost = "localhost";
            parsedPort = 5432;
        }
        
        try {
            SpringApplication.run(HostelConnectApplication.class, args);
        } catch (Exception e) {
            runDiagnostics();
            throw e;
        }
    }

    private static void runDiagnostics() {
        System.out.println("\n=== DATABASE DIAGNOSTICS START ===");
        System.out.println("Host: " + parsedHost);
        System.out.println("Port: " + parsedPort);
        
        if (parsedHost == null || parsedHost.isEmpty()) {
            System.out.println("Diagnostics: Host name is empty.");
            System.out.println("=== DATABASE DIAGNOSTICS END ===\n");
            return;
        }
        
        // 1. DNS Resolution Test
        try {
            java.net.InetAddress[] addresses = java.net.InetAddress.getAllByName(parsedHost);
            System.out.println("DNS Status: SUCCESS! Resolved " + parsedHost + " to " + addresses.length + " address(es):");
            for (java.net.InetAddress addr : addresses) {
                System.out.println("  - " + addr.getHostAddress());
            }
        } catch (java.net.UnknownHostException e) {
            System.out.println("DNS Status: FAILED to resolve hostname. Error: " + e.getMessage());
            System.out.println("Hint: The hostname is incorrect or not resolvable inside Render. If you are using an Internal URL, make sure the database is in the same Render account and region as the web service.");
            System.out.println("=== DATABASE DIAGNOSTICS END ===\n");
            return;
        }
        
        // 2. TCP Socket Connection Test
        try (java.net.Socket socket = new java.net.Socket()) {
            System.out.println("TCP Status: Attempting TCP connection to " + parsedHost + ":" + parsedPort + " (timeout 5s)...");
            socket.connect(new java.net.InetSocketAddress(parsedHost, parsedPort), 5000);
            System.out.println("TCP Status: SUCCESS! Port " + parsedPort + " is open and accepting connections.");
        } catch (Exception e) {
            System.out.println("TCP Status: FAILED to connect. Error: " + e.getMessage());
            System.out.println("Hint: A firewall is blocking the connection, the database is offline, or the port is closed.");
        }
        System.out.println("=== DATABASE DIAGNOSTICS END ===\n");
    }

    private static String convertDatabaseUrl(String dbUrl) {
        try {
            String cleanUrl = dbUrl;
            if (cleanUrl.startsWith("jdbc:postgresql://")) {
                cleanUrl = cleanUrl.substring("jdbc:postgresql://".length());
            } else if (cleanUrl.startsWith("jdbc:postgres://")) {
                cleanUrl = cleanUrl.substring("jdbc:postgres://".length());
            } else if (cleanUrl.startsWith("postgres://")) {
                cleanUrl = cleanUrl.substring("postgres://".length());
            } else if (cleanUrl.startsWith("postgresql://")) {
                cleanUrl = cleanUrl.substring("postgresql://".length());
            }
            
            String username = null;
            String password = null;
            String hostAndDb = cleanUrl;
            
            // Check if credentials are embedded in the URI
            int lastAtIndex = cleanUrl.lastIndexOf('@');
            if (lastAtIndex != -1) {
                String credentials = cleanUrl.substring(0, lastAtIndex);
                hostAndDb = cleanUrl.substring(lastAtIndex + 1);
                
                int firstColonIndex = credentials.indexOf(':');
                if (firstColonIndex != -1) {
                    username = credentials.substring(0, firstColonIndex);
                    password = credentials.substring(firstColonIndex + 1);
                } else {
                    username = credentials;
                }
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
            
            // Clean host of any copy-paste placeholder brackets if present
            host = host.replace("<", "").replace(">", "");
            
            parsedHost = host;
            try {
                parsedPort = Integer.parseInt(port);
            } catch (NumberFormatException nfe) {
                parsedPort = 5432;
            }
            
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            
            // Append parameters
            if (username != null && password != null) {
                jdbcUrl += "?user=" + username + "&password=" + password + "&sslmode=require";
            } else {
                jdbcUrl += "?sslmode=require";
            }
            
            return jdbcUrl;
        } catch (Exception e) {
            System.err.println("[STARTUP] Failed to parse DATABASE_URL: " + e.getMessage());
            return dbUrl;
        }
    }
}
