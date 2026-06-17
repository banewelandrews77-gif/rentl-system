package gh.hostelconnect.dto.inquiry;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateInquiryRequest(
        @NotNull(message = "Hostel ID is required") UUID hostelId,

        UUID roomTypeId,
        String message) {
}
