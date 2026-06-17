package gh.hostelconnect.dto.support;

import gh.hostelconnect.domain.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespondTicketRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;

    @NotBlank(message = "Response message is required")
    private String response;
}
