package gh.hostelconnect.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Value("${app.admin.email:hostelconnectgh5@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${SENDGRID_API_KEY:}")
    private String sendGridApiKey;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean sendViaSmtp(String toEmail, String subject, String text, String replyToEmail) {
        if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = (mailUsername != null && !mailUsername.isBlank()) ? mailUsername : fromEmail;
            helper.setFrom(sender, "HostelConnect GH");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(text, false);

            if (replyToEmail != null && !replyToEmail.isBlank()) {
                helper.setReplyTo(replyToEmail);
            }

            mailSender.send(message);
            log.info("Successfully sent email via SMTP to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private boolean sendViaSendGrid(String toEmail, String subject, String text, String replyToEmail) {
        if (sendGridApiKey == null || sendGridApiKey.isBlank()) {
            return false;
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
            log.info("Successfully sent email via SendGrid API to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email via SendGrid API to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    private void dispatchEmail(String toEmail, String subject, String text, String replyToEmail) {
        // Try SMTP first (Gmail / standard SMTP)
        if (sendViaSmtp(toEmail, subject, text, replyToEmail)) {
            return;
        }

        // Try SendGrid API second
        if (sendViaSendGrid(toEmail, subject, text, replyToEmail)) {
            return;
        }

        log.warn("No active email credentials (MAIL_PASSWORD or SENDGRID_API_KEY). Email to {} was not sent online.", toEmail);
    }

    @Async
    public void sendVerificationOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail);
        String subject = "Verify your HostelConnect GH email";
        String text = "Hello,\n\nYour verification code is: " + otp + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH";
        dispatchEmail(toEmail, subject, text, null);
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail);
        String subject = "Reset your HostelConnect GH password";
        String text = "Hello,\n\nYour password reset code is: " + otp + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH";
        dispatchEmail(toEmail, subject, text, null);
    }

    @Async
    public void sendAgentApprovalEmail(String toEmail, String fullName) {
        String subject = "Congratulations! Your Agent Account is Verified";
        String text = "Hello " + fullName + ",\n\nWe are pleased to inform you that your agent account on HostelConnect GH has been verified.\n\nYou can now start posting hostel listings and managing your profile.\n\nWelcome aboard!\n\n— HostelConnect GH Team";
        dispatchEmail(toEmail, subject, text, null);
    }

    @Async
    public void sendAgentRejectionEmail(String toEmail, String fullName, String reason) {
        String subject = "Update regarding your Agent Verification";
        String text = "Hello " + fullName + ",\n\nThank you for your interest in becoming an agent on HostelConnect GH.\n\nUnfortunately, your verification request could not be approved at this time for the following reason:\n\n\"" + reason + "\"\n\nYou can log in to your dashboard to update your information and resubmit for verification.\n\n— HostelConnect GH Team";
        dispatchEmail(toEmail, subject, text, null);
    }

    @Async
    public void sendContactMessage(String name, String email, String subject, String message) {
        String mailSubject = "Support Request: " + subject;
        String text = "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message;
        dispatchEmail(fromEmail, mailSubject, text, email);
    }

    @Async
    public void sendTicketUpdateEmail(String toEmail, String name, String ticketId, String subject, String status, String response) {
        String mailSubject = "Update regarding your Support Ticket: " + ticketId;
        String text = "Hello " + name + ",\n\nYour support ticket (" + ticketId + ") has been updated.\n\nTicket Subject: " + subject + "\nNew Status: " + status + "\n\nAdmin Response:\n" + response + "\n\nYou can track the progress of this ticket under the 'Ticket History' tab on our Support page.\n\n— HostelConnect GH Team";
        dispatchEmail(toEmail, mailSubject, text, null);
    }
}
