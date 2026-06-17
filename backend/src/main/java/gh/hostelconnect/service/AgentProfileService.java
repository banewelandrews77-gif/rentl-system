package gh.hostelconnect.service;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import gh.hostelconnect.dto.agent.AgentProfileResponse;
import gh.hostelconnect.dto.reservation.InitializePaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentProfileService {

    private final AgentProfileRepository agentProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PaystackService paystackService;

    public AgentProfileResponse getCurrentAgentProfile(UUID userId) {
        AgentProfile profile = agentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));
        return AgentProfileResponse.fromEntity(profile);
    }

    @Transactional
    public AgentProfile uploadVerificationDocuments(UUID userId, MultipartFile ghanaCard, MultipartFile facePhoto, String ghanaCardNumber) {
        AgentProfile profile = agentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));

        if (profile.getVerificationStatus() == AgentProfile.VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Profile is already verified");
        }

        String ghanaCardName = fileStorageService.storeFile(ghanaCard);
        String facePhotoName = fileStorageService.storeFile(facePhoto);

        String ghanaCardUri = "/api/files/" + ghanaCardName;
        String facePhotoUri = "/api/files/" + facePhotoName;

        profile.setGhanaCardUrl(ghanaCardUri);
        profile.setFacePhotoUrl(facePhotoUri);
        profile.setGhanaCardNumber(ghanaCardNumber);
        
        // Also update the old field for backward compatibility or if needed by previous parts of the UI
        profile.setIdDocumentUrl(ghanaCardUri); 
        
        profile.setVerificationStatus(AgentProfile.VerificationStatus.PENDING);
        profile.setSubmissionCount(profile.getSubmissionCount() + 1);

        return agentProfileRepository.save(profile);
    }

    @Transactional
    public InitializePaymentResponse initializeSubscriptionPayment(UUID userId) {
        AgentProfile profile = agentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));

        if (profile.getVerificationStatus() != AgentProfile.VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Only verified agents can subscribe.");
        }

        User user = profile.getUser();
        String reference = "SUB_" + profile.getId().toString() + "_" + System.currentTimeMillis();

        // 50 GHS for one academic year
        BigDecimal amount = new BigDecimal("50.00");
        String callbackUrl = "http://localhost:3000/dashboard/agent/subscription/callback";

        return paystackService.initializeTransaction(user.getEmail(), amount, reference, callbackUrl, user.getPhoneNumber());
    }

    @Transactional
    public boolean verifySubscriptionPayment(UUID userId, String reference) {
        AgentProfile profile = agentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));

        if (paystackService.verifyTransaction(reference)) {
            Instant currentUntil = profile.getSubscriptionValidUntil();
            Instant newUntil;
            if (currentUntil != null && currentUntil.isAfter(Instant.now())) {
                newUntil = currentUntil.plus(365, ChronoUnit.DAYS);
            } else {
                newUntil = Instant.now().plus(365, ChronoUnit.DAYS);
            }
            profile.setSubscriptionValidUntil(newUntil);
            agentProfileRepository.save(profile);
            return true;
        }
        return false;
    }
}
