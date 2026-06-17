package gh.hostelconnect.repository;

import gh.hostelconnect.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(User.Role role);

    List<User> findByRoleOrderByFullNameAsc(User.Role role);
}
