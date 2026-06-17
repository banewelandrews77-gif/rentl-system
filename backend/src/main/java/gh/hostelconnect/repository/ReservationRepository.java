package gh.hostelconnect.repository;

import gh.hostelconnect.domain.Reservation;
import gh.hostelconnect.domain.ReservationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    @EntityGraph(attributePaths = {"hostel", "roomType"})
    List<Reservation> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);

    @EntityGraph(attributePaths = {"hostel", "hostel.agent", "hostel.agent.user", "customer", "roomType"})
    @Query("SELECT r FROM Reservation r WHERE r.id = :id")
    Optional<Reservation> findByIdFull(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"hostel", "customer", "roomType"})
    List<Reservation> findByHostel_IdOrderByCreatedAtDesc(UUID hostelId);

    Optional<Reservation> findByPaymentReference(String paymentReference);

    List<Reservation> findByStatusAndCreatedAtBefore(ReservationStatus status, Instant dateTime);

    void deleteByCustomer_Id(UUID customerId);
    void deleteByHostel_Id(UUID hostelId);
}
