package gh.hostelconnect.dto.reservation;

import gh.hostelconnect.domain.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ReservationResponse {
    private UUID id;
    private UUID hostelId;
    private String hostelName;
    private UUID roomTypeId;
    private String roomTypeName;
    private ReservationStatus status;
    private String paymentReference;
    private BigDecimal amountPaid;
    private LocalDate startDate;
    private LocalDate endDate;
    private Instant createdAt;
}
