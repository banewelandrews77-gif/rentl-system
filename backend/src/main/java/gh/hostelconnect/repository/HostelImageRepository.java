package gh.hostelconnect.repository;

import gh.hostelconnect.domain.HostelImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HostelImageRepository extends JpaRepository<HostelImage, UUID> {
    List<HostelImage> findByHostelId(UUID hostelId);
}
