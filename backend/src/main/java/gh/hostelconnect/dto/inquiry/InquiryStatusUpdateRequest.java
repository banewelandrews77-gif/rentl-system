package gh.hostelconnect.dto.inquiry;

import gh.hostelconnect.domain.InquiryStatus;
import jakarta.validation.constraints.NotNull;

public record InquiryStatusUpdateRequest(
        @NotNull(message = "Status is required") InquiryStatus status) {
}
