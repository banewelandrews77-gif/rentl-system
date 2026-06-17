package gh.hostelconnect.repository;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.AgentProfile.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentProfileRepository extends JpaRepository<AgentProfile, UUID> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user" })
    Optional<AgentProfile> findByUserId(UUID userId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user" })
    java.util.List<AgentProfile> findByVerificationStatus(VerificationStatus status);

    long countByVerificationStatus(VerificationStatus status);
}
