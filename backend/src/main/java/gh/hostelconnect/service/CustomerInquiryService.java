package gh.hostelconnect.service;

import gh.hostelconnect.domain.*;
import gh.hostelconnect.dto.inquiry.CreateInquiryRequest;
import gh.hostelconnect.dto.inquiry.InquiryResponse;
import gh.hostelconnect.repository.HostelRepository;
import gh.hostelconnect.repository.InquiryRepository;
import gh.hostelconnect.repository.RoomTypeRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerInquiryService {
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final RoomTypeRepository roomTypeRepository;

    @Transactional
    public InquiryResponse submitInquiry(UUID customerId, CreateInquiryRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Hostel hostel = hostelRepository.findById(request.hostelId())
                .orElseThrow(() -> new RuntimeException("Hostel not found"));

        RoomType roomType = null;
        if (request.roomTypeId() != null) {
            roomType = roomTypeRepository.findById(request.roomTypeId())
                    .orElseThrow(() -> new RuntimeException("Room type not found"));
            if (!roomType.getHostel().getId().equals(hostel.getId())) {
                throw new RuntimeException("Room type does not belong to the specified hostel");
            }
        }

        Inquiry inquiry = Inquiry.builder()
                .customer(customer)
                .hostel(hostel)
                .roomType(roomType)
                .message(request.message())
                .status(InquiryStatus.PENDING)
                .build();

        inquiry = inquiryRepository.save(inquiry);
        return mapToResponse(inquiry);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponse> getMyInquiries(UUID customerId) {
        return inquiryRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InquiryResponse mapToResponse(Inquiry inquiry) {
        User agentUser = inquiry.getHostel().getAgent().getUser();
        boolean isApproved = inquiry.getStatus() == InquiryStatus.APPROVED;

        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getHostel().getId(),
                inquiry.getHostel().getName(),
                inquiry.getRoomType() != null ? inquiry.getRoomType().getId() : null,
                inquiry.getRoomType() != null ? inquiry.getRoomType().getName() : null,
                inquiry.getMessage(),
                inquiry.getStatus(),
                inquiry.getCreatedAt(),
                // Only reveal agent details if APPROVED
                isApproved ? agentUser.getFullName() : "Hidden (Pending Approval)",
                isApproved ? agentUser.getEmail() : null,
                isApproved ? agentUser.getPhoneNumber() : null,
                // Customer details aren't needed on the customer dashboard
                null,
                null,
                null);
    }
}
