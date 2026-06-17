package gh.hostelconnect.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    @Column(name = "id_document_url")
    private String idDocumentUrl;

    @Column(name = "ghana_card_url")
    private String ghanaCardUrl;

    @Column(name = "ghana_card_number")
    private String ghanaCardNumber;

    @Column(name = "face_photo_url")
    private String facePhotoUrl;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "submission_count", nullable = false)
    @Builder.Default
    private int submissionCount = 0;

    @Column(name = "subscription_valid_until")
    private Instant subscriptionValidUntil;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum VerificationStatus {
        UNVERIFIED,
        PENDING,
        VERIFIED,
        REJECTED,
        SUSPENDED
    }
}
