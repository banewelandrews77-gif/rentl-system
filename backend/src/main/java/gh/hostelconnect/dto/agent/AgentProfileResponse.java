package gh.hostelconnect.dto.agent;

import gh.hostelconnect.domain.AgentProfile;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AgentProfileResponse {
    private UUID id;
    private UUID userId;
    private AgentProfile.VerificationStatus verificationStatus;
    private String idDocumentUrl;
    private String ghanaCardUrl;
    private String ghanaCardNumber;
    private String facePhotoUrl;
    private String rejectionReason;
    private Instant subscriptionValidUntil;

    public static AgentProfileResponse fromEntity(AgentProfile profile) {
        return AgentProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .verificationStatus(profile.getVerificationStatus())
                .idDocumentUrl(profile.getIdDocumentUrl())
                .ghanaCardUrl(profile.getGhanaCardUrl())
                .ghanaCardNumber(profile.getGhanaCardNumber())
                .facePhotoUrl(profile.getFacePhotoUrl())
                .rejectionReason(profile.getRejectionReason())
                .subscriptionValidUntil(profile.getSubscriptionValidUntil())
                .build();
    }
}
