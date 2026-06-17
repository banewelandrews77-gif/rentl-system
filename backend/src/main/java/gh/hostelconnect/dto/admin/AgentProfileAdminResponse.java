package gh.hostelconnect.dto.admin;

import gh.hostelconnect.domain.AgentProfile;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AgentProfileAdminResponse {
    private UUID id;
    private VerificationStatusResponse verificationStatus;
    private String idDocumentUrl;
    private String ghanaCardUrl;
    private String ghanaCardNumber;
    private String facePhotoUrl;
    private String rejectionReason;
    private int submissionCount;
    private Instant subscriptionValidUntil;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private UUID id;
        private String fullName;
        private String email;
        private String phoneNumber;
    }

    public enum VerificationStatusResponse {
        UNVERIFIED, PENDING, VERIFIED, REJECTED, SUSPENDED
    }

    public static AgentProfileAdminResponse fromEntity(AgentProfile profile) {
        return AgentProfileAdminResponse.builder()
                .id(profile.getId())
                .verificationStatus(VerificationStatusResponse.valueOf(profile.getVerificationStatus().name()))
                .idDocumentUrl(profile.getIdDocumentUrl())
                .ghanaCardUrl(profile.getGhanaCardUrl())
                .ghanaCardNumber(profile.getGhanaCardNumber())
                .facePhotoUrl(profile.getFacePhotoUrl())
                .rejectionReason(profile.getRejectionReason())
                .submissionCount(profile.getSubmissionCount())
                .subscriptionValidUntil(profile.getSubscriptionValidUntil())
                .user(UserInfo.builder()
                        .id(profile.getUser().getId())
                        .fullName(profile.getUser().getFullName())
                        .email(profile.getUser().getEmail())
                        .phoneNumber(profile.getUser().getPhoneNumber())
                        .build())
                .build();
    }
}
