package gh.hostelconnect.repository;

import gh.hostelconnect.domain.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {

    List<SupportTicket> findByEmailOrderByCreatedAtDesc(String email);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
