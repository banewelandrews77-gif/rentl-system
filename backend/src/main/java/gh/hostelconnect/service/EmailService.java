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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${app.admin.email:admin@hostelconnect.gh}")
    private String fromEmail;

    @Value("${SENDGRID_API_KEY:}")
    private String sendGridApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private void sendEmailViaApi(String toEmail, String subject, String text, String replyToEmail) {
        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            log.warn("SENDGRID_API_KEY is not set. Cannot send email to {}", toEmail);
            return;
        }

        try {
            String url = "https://api.sendgrid.com/v3/mail/send";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(sendGridApiKey);

            Map<String, Object> body = new HashMap<>();
            
            Map<String, Object> personalization = new HashMap<>();
            personalization.put("to", List.of(Map.of("email", toEmail)));
            personalization.put("subject", subject);
            body.put("personalizations", List.of(personalization));

            body.put("from", Map.of("email", fromEmail));
            
            if (replyToEmail != null && !replyToEmail.isBlank()) {
                body.put("reply_to", Map.of("email", replyToEmail));
            }
            
            Map<String, Object> content = new HashMap<>();
            content.put("type", "text/plain");
            content.put("value", text);
            body.put("content", List.of(content));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Successfully sent email via HTTP API to {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send email via SendGrid API to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendVerificationOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail);
        String subject = "Verify your HostelConnect GH email";
        String text = "Your verification code is: " + otp + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH";
        sendEmailViaApi(toEmail, subject, text, null);
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail);
        String subject = "Reset your HostelConnect GH password";
        String text = "Your password reset code is: " + otp + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH";
        sendEmailViaApi(toEmail, subject, text, null);
    }

    @Async
    public void sendAgentApprovalEmail(String toEmail, String fullName) {
        String subject = "Congratulations! Your Agent Account is Verified";
        String text = "Hello " + fullName + ",\n\nWe are pleased to inform you that your agent account on HostelConnect GH has been verified.\n\nYou can now start posting hostel listings and managing your profile.\n\nWelcome aboard!\n\n— HostelConnect GH Team";
        sendEmailViaApi(toEmail, subject, text, null);
    }

    @Async
    public void sendAgentRejectionEmail(String toEmail, String fullName, String reason) {
        String subject = "Update regarding your Agent Verification";
        String text = "Hello " + fullName + ",\n\nThank you for your interest in becoming an agent on HostelConnect GH.\n\nUnfortunately, your verification request could not be approved at this time for the following reason:\n\n\"" + reason + "\"\n\nYou can log in to your dashboard to update your information and resubmit for verification.\n\n— HostelConnect GH Team";
        sendEmailViaApi(toEmail, subject, text, null);
    }

    @Async
    public void sendContactMessage(String name, String email, String subject, String message) {
        String mailSubject = "Support Request: " + subject;
        String text = "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message;
        sendEmailViaApi(fromEmail, mailSubject, text, email);
    }

    @Async
    public void sendTicketUpdateEmail(String toEmail, String name, String ticketId, String subject, String status, String response) {
        String mailSubject = "Update regarding your Support Ticket: " + ticketId;
        String text = "Hello " + name + ",\n\nYour support ticket (" + ticketId + ") has been updated.\n\nTicket Subject: " + subject + "\nNew Status: " + status + "\n\nAdmin Response:\n" + response + "\n\nYou can track the progress of this ticket under the 'Ticket History' tab on our Support page.\n\n— HostelConnect GH Team";
        sendEmailViaApi(toEmail, mailSubject, text, null);
    }
}
