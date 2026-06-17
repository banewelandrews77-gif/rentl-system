package gh.hostelconnect.repository;

import gh.hostelconnect.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "hostel"})
    List<Review> findByHostelIdOrderByCreatedAtDesc(UUID hostelId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "hostel"})
    List<Review> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "hostel"})
    List<Review> findByHostel_IdInOrderByCreatedAtDesc(List<UUID> hostelIds);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"customer", "hostel"})
    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hostel.id = :hostelId")
    Double getAverageRatingForHostel(@org.springframework.data.repository.query.Param("hostelId") UUID hostelId);

    long countByHostelId(UUID hostelId);

    @Query("SELECT r.hostel.id, AVG(r.rating), COUNT(r) FROM Review r WHERE r.hostel.id IN :hostelIds GROUP BY r.hostel.id")
    List<Object[]> getReviewStatsForHostels(@org.springframework.data.repository.query.Param("hostelIds") List<UUID> hostelIds);

    boolean existsByCustomer_IdAndHostel_Id(UUID customerId, UUID hostelId);

    void deleteByCustomer_Id(UUID customerId);
    void deleteByHostelId(UUID hostelId);
}

