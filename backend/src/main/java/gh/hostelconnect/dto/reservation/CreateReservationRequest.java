package gh.hostelconnect.dto.reservation;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateReservationRequest(
        @NotNull(message = "Hostel ID is required") UUID hostelId,

        @NotNull(message = "Room Type ID is required") UUID roomTypeId,

        @NotNull(message = "Start date is required") @FutureOrPresent(message = "Start date must be today or in the future") LocalDate startDate,

        @NotNull(message = "End date is required") @Future(message = "End date must be in the future") LocalDate endDate) {
}
