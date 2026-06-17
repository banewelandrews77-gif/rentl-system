package gh.hostelconnect.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReviewRequest(
        @NotNull(message = "Hostel ID is required") UUID hostelId,

        @NotNull(message = "Rating is required") @Min(value = 1, message = "Rating must be at least 1") @Max(value = 5, message = "Rating must be at most 5") Integer rating,

        String comment) {
}
