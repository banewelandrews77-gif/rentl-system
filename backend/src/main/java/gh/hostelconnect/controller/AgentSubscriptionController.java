package gh.hostelconnect.controller;

import gh.hostelconnect.dto.reservation.InitializePaymentResponse;
import gh.hostelconnect.service.AgentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agents/subscription")
@RequiredArgsConstructor
public class AgentSubscriptionController {

    private final AgentProfileService agentProfileService;

    @PostMapping("/initialize")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<InitializePaymentResponse> initializeSubscription(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        InitializePaymentResponse response = agentProfileService.initializeSubscriptionPayment(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<Map<String, String>> verifySubscription(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());
        String reference = payload.get("reference");

        if (reference == null || reference.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment reference is required"));
        }

        boolean success = agentProfileService.verifySubscriptionPayment(userId, reference);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Subscription verified and activated successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Subscription payment verification failed"));
        }
    }
}
