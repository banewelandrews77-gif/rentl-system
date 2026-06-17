package gh.hostelconnect.config;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeedRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Override
    public void run(ApplicationArguments args) {
        String adminEmail = appProperties.getAdmin().getEmail();
        String oldAdminEmail = "admin@hostelconnect.gh";
        
        // Clean up the old admin account if it exists
        userRepository.findByEmail(oldAdminEmail).ifPresent(oldAdmin -> {
            userRepository.delete(oldAdmin);
            log.info("Deleted old admin account: {}", oldAdminEmail);
        });

        var existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .fullName("Andrews Banewel")
                    .email(adminEmail)
                    .phoneNumber("+233240000000")
                    .passwordHash(passwordEncoder.encode(appProperties.getAdmin().getPassword()))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Successfully seeded admin user: {}", adminEmail);
        } else {
            User admin = existingAdmin.get();
            admin.setPasswordHash(passwordEncoder.encode(appProperties.getAdmin().getPassword()));
            userRepository.save(admin);
            log.info("Forced password sync for admin user: {}", adminEmail);
        }

        // Seed a pending agent for testing the Verification Queue
        String pendingAgentEmail = "pending.agent@hostelconnect.gh";
        if (userRepository.findByEmail(pendingAgentEmail).isEmpty()) {
            User pendingAgent = User.builder()
                    .fullName("Kwame Pending")
                    .email(pendingAgentEmail)
                    .phoneNumber("+233241111111")
                    .passwordHash(passwordEncoder.encode("Agent@123"))
                    .role(User.Role.AGENT)
                    .emailVerified(true)
                    .active(true)
                    .build();

            pendingAgent = userRepository.save(pendingAgent);

            AgentProfile profile = AgentProfile.builder()
                    .user(pendingAgent)
                    .verificationStatus(AgentProfile.VerificationStatus.PENDING)
                    .idDocumentUrl("https://example.com/dummy-id.jpg")
                    .build();

            agentProfileRepository.save(profile);
        }
    }
}
