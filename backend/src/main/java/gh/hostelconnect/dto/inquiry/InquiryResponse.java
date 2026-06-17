package gh.hostelconnect.dto.inquiry;

import gh.hostelconnect.domain.InquiryStatus;
import java.time.Instant;
import java.util.UUID;

public record InquiryResponse(
        UUID id,
        UUID hostelId,
        String hostelName,
        UUID roomTypeId,
        String roomTypeName,
        String message,
        InquiryStatus status,
        Instant createdAt,

        // Agent info (only shown to customer if APPROVED)
        String agentName,
        String agentEmail,
        String agentPhone,

        // Customer info (only shown to agent)
        String customerName,
        String customerEmail,
        String customerPhone) {
}
