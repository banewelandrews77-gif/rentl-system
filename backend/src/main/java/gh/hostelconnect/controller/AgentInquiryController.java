package gh.hostelconnect.controller;

import gh.hostelconnect.dto.inquiry.InquiryResponse;
import gh.hostelconnect.dto.inquiry.InquiryStatusUpdateRequest;
import gh.hostelconnect.service.AgentInquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agents/inquiries")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
public class AgentInquiryController {

    private final AgentInquiryService inquiryService;

    @GetMapping
    public ResponseEntity<List<InquiryResponse>> getInquiriesForAgent(Authentication authentication) {
        UUID agentId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(inquiryService.getInquiriesForAgent(agentId));
    }

    @PutMapping("/{inquiryId}/status")
    public ResponseEntity<InquiryResponse> updateInquiryStatus(
            @PathVariable UUID inquiryId,
            @Valid @RequestBody InquiryStatusUpdateRequest request,
            Authentication authentication) {
        UUID agentId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(inquiryService.updateInquiryStatus(agentId, inquiryId, request));
    }
}
