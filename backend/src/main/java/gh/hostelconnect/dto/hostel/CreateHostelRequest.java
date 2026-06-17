package gh.hostelconnect.dto.hostel;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateHostelRequest {
    @NotBlank(message = "Hostel name is required")
    private String name;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    private String gpsCoordinates;

    private String schoolSlug;
}
