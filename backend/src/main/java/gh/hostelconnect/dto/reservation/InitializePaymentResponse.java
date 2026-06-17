package gh.hostelconnect.dto.reservation;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitializePaymentResponse {
    private String authorizationUrl;
    private String accessCode;
    private String reference;
}
