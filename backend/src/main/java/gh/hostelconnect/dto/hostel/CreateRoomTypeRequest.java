package gh.hostelconnect.dto.hostel;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateRoomTypeRequest {
    @NotBlank(message = "Room type name is required")
    private String name;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotNull(message = "Price is required")
    private BigDecimal pricePerYear;

    @Min(value = 1, message = "Total available must be at least 1")
    private int totalAvailable;
}
