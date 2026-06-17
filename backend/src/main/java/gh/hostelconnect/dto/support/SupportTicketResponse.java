package gh.hostelconnect.dto.support;

import gh.hostelconnect.domain.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponse {
    private UUID id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private TicketStatus status;
    private String adminResponse;
    private Instant createdAt;
    private Instant updatedAt;
}
