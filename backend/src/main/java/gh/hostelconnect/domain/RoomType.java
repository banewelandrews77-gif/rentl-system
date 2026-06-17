package gh.hostelconnect.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "room_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @Column(nullable = false)
    private String name; // e.g., "1 in a room", "4 in a room"

    @Column(nullable = false)
    private int capacity; // e.g., 1, 4

    @Column(name = "price_per_year", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerYear;

    @Column(name = "total_available", nullable = false)
    private int totalAvailable; // How many rooms of this type exist in the hostel

    @Column(name = "available_count", nullable = false)
    private int availableCount; // How many are currently available to book

    @Column(name = "image_url")
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
