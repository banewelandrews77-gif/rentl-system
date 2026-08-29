package gh.hostelconnect.controller;

import gh.hostelconnect.dto.agent.AgentProfileResponse;
import gh.hostelconnect.service.AgentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agents/profile")
@RequiredArgsConstructor
public class AgentProfileController {

    private final AgentProfileService agentProfileService;

    @PostMapping("/document")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadVerificationDocuments(
            @RequestParam("ghanaCard") MultipartFile ghanaCard,
            @RequestParam("facePhoto") MultipartFile facePhoto,
            @RequestParam("ghanaCardNumber") String ghanaCardNumber,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        agentProfileService.uploadVerificationDocuments(userId, ghanaCard, facePhoto, ghanaCardNumber);

        return ResponseEntity
                .ok(Map.of("message", "Ghana Card and Face Scan uploaded successfully. Your profile is now pending verification."));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<AgentProfileResponse> getMyProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(agentProfileService.getCurrentAgentProfile(userId));
    }
}
