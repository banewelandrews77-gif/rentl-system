package gh.hostelconnect.repository;

import gh.hostelconnect.domain.Inquiry;
import gh.hostelconnect.domain.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"hostel", "hostel.agent", "hostel.agent.user", "roomType"})
    List<Inquiry> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"hostel", "hostel.agent", "hostel.agent.user", "roomType"})
    List<Inquiry> findByHostel_Agent_User_IdOrderByCreatedAtDesc(UUID agentId);

    void deleteByCustomer_Id(UUID customerId);
    void deleteByHostel_Id(UUID hostelId);
}
