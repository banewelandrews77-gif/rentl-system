package gh.hostelconnect.service;

import gh.hostelconnect.dto.reservation.InitializePaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaystackService {

    private final RestTemplate restTemplate;

    @Value("${paystack.secret-key:sk_test_placeholder}")
    private String secretKey;

    private static final String PAYSTACK_INITIALIZE_URL = "https://api.paystack.co/transaction/initialize";
    private static final String PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/";

    public InitializePaymentResponse initializeTransaction(String email, BigDecimal amount, String reference) {
        return initializeTransaction(email, amount, reference, "http://localhost:3000/payment/callback", null);
    }

    public InitializePaymentResponse initializeTransaction(String email, BigDecimal amount, String reference,
            String callbackUrl, String phoneNumber) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(secretKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("email", email);
        // Paystack expects amount in pesewas/kobo (lowest currency unit), so multiply
        // by 100
        requestBody.put("amount", amount.multiply(new BigDecimal("100")).intValue());
        requestBody.put("reference", reference);
        requestBody.put("callback_url", callbackUrl);
        requestBody.put("currency", "GHS");
        requestBody.put("channels", new String[] { "card", "mobile_money" });

        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            Map<String, Object> metadata = new HashMap<>();
            Map<String, String> customField = new HashMap<>();
            customField.put("display_name", "Phone Number");
            customField.put("variable_name", "phone_number");
            customField.put("value", phoneNumber);
            metadata.put("custom_fields", new Object[] { customField });
            requestBody.put("metadata", metadata);
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(PAYSTACK_INITIALIZE_URL, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseData = (Map<String, Object>) response.getBody().get("data");
                return InitializePaymentResponse.builder()
                        .authorizationUrl((String) responseData.get("authorization_url"))
                        .accessCode((String) responseData.get("access_code"))
                        .reference((String) responseData.get("reference"))
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to initialize Paystack transaction", e);
            throw new RuntimeException("Failed to initialize payment transaction with provider.");
        }
        throw new RuntimeException("Unexpected response from payment provider.");
    }

    public boolean verifyTransaction(String reference) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(secretKey);
        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(PAYSTACK_VERIFY_URL + reference,
                    org.springframework.http.HttpMethod.GET,
                    request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                String status = (String) data.get("status");
                return "success".equals(status);
            }
        } catch (Exception e) {
            log.error("Failed to verify Paystack transaction: {}", reference, e);
        }
        return false;
    }
}
