package gh.hostelconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${arkesel.api-key:}")
    private String arkeselApiKey;

    @Value("${arkesel.sender-id:HostelConn}")
    private String arkeselSenderId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendVerificationOtp(String phoneNumber, String otp) {
        log.info("LOCAL DEV SMS OTP: {} for phone: {}", otp, phoneNumber);
        String message = "Your HostelConnect verification code is: " + otp + ". This code expires in 15 minutes.";
        sendSmsViaArkesel(phoneNumber, message);
    }

    @Async
    public void sendPasswordResetOtp(String phoneNumber, String otp) {
        log.info("LOCAL DEV SMS OTP: {} for phone: {}", otp, phoneNumber);
        String message = "Your HostelConnect password reset code is: " + otp + ". This code expires in 15 minutes.";
        sendSmsViaArkesel(phoneNumber, message);
    }

    private void sendSmsViaArkesel(String phoneNumber, String message) {
        if (arkeselApiKey == null || arkeselApiKey.isBlank()) {
            log.warn("ARKESEL_API_KEY is not set. Cannot send SMS to {}", phoneNumber);
            return;
        }

        try {
            String url = "https://sms.arkesel.com/api/v2/sms/send";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", arkeselApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", arkeselSenderId);
            body.put("message", message);
            body.put("recipients", new String[]{formatPhoneNumber(phoneNumber)});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Successfully sent SMS via Arkesel to {}", phoneNumber);

        } catch (Exception e) {
            log.error("Failed to send SMS via Arkesel to {}: {}", phoneNumber, e.getMessage());
        }
    }

    private String formatPhoneNumber(String phone) {
        if (phone == null) return "";
        // Strip everything except numbers
        String clean = phone.replaceAll("[^0-9]", "");
        // If it starts with 0 and has 10 digits (Ghana standard), e.g. 0595934551, convert to 233595934551
        if (clean.startsWith("0") && clean.length() == 10) {
            return "233" + clean.substring(1);
        }
        return clean;
    }
}
