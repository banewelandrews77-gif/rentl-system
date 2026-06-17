package gh.hostelconnect.repository;

import gh.hostelconnect.domain.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {
    List<RoomType> findByHostelId(UUID hostelId);
}
