package gh.hostelconnect.controller;

import gh.hostelconnect.dto.inquiry.CreateInquiryRequest;
import gh.hostelconnect.dto.inquiry.InquiryResponse;
import gh.hostelconnect.service.CustomerInquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/inquiries")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class CustomerInquiryController {

    private final CustomerInquiryService inquiryService;

    @PostMapping
    public ResponseEntity<InquiryResponse> submitInquiry(
            @Valid @RequestBody CreateInquiryRequest request,
            Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(inquiryService.submitInquiry(customerId, request));
    }

    @GetMapping
    public ResponseEntity<List<InquiryResponse>> getMyInquiries(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(inquiryService.getMyInquiries(customerId));
    }
}
