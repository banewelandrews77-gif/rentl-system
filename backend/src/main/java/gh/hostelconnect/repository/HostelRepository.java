package gh.hostelconnect.repository;

import gh.hostelconnect.domain.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "agent", "agent.user" })
    List<Hostel> findByAgentId(UUID agentId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "agent", "agent.user" })
    List<Hostel> findByStatus(Hostel.Status status);
}
