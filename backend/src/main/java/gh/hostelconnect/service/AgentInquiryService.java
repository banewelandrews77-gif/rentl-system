package gh.hostelconnect.service;

import gh.hostelconnect.domain.Inquiry;
import gh.hostelconnect.domain.InquiryStatus;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.inquiry.InquiryResponse;
import gh.hostelconnect.dto.inquiry.InquiryStatusUpdateRequest;
import gh.hostelconnect.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentInquiryService {
    private final InquiryRepository inquiryRepository;

    @Transactional(readOnly = true)
    public List<InquiryResponse> getInquiriesForAgent(UUID agentId) {
        return inquiryRepository.findByHostel_Agent_User_IdOrderByCreatedAtDesc(agentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InquiryResponse updateInquiryStatus(UUID agentId, UUID inquiryId, InquiryStatusUpdateRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        // Verify ownership
        if (!inquiry.getHostel().getAgent().getUser().getId().equals(agentId)) {
            throw new RuntimeException("You do not have permission to update this inquiry");
        }

        inquiry.setStatus(request.status());
        inquiry = inquiryRepository.save(inquiry);
        return mapToResponse(inquiry);
    }

    private InquiryResponse mapToResponse(Inquiry inquiry) {
        User customer = inquiry.getCustomer();
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getHostel().getId(),
                inquiry.getHostel().getName(),
                inquiry.getRoomType() != null ? inquiry.getRoomType().getId() : null,
                inquiry.getRoomType() != null ? inquiry.getRoomType().getName() : null,
                inquiry.getMessage(),
                inquiry.getStatus(),
                inquiry.getCreatedAt(),
                null, null, null, // Agent details aren't needed on the Agent dashboard
                customer.getFullName(),
                customer.getEmail(),
                customer.getPhoneNumber());
    }
}
