package gh.hostelconnect.dto.review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID hostelId,
        String hostelName,
        UUID customerId,
        String customerName,
        Integer rating,
        String comment,
        Instant createdAt) {
}
