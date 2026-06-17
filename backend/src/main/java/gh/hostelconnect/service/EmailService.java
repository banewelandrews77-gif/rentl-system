package gh.hostelconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.admin.email:admin@hostelconnect.gh}")
    private String fromEmail;

    @Async
    public void sendVerificationOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail); // Added for local testing
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Verify your HostelConnect GH email");
            msg.setText(
                    "Your verification code is: " + otp + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH");
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetOtp(String toEmail, String otp) {
        log.info("LOCAL DEV OTP: {} for email: {}", otp, toEmail); // Added for local testing
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Reset your HostelConnect GH password");
            msg.setText("Your password reset code is: " + otp
                    + "\n\nThis code expires in 15 minutes.\n\n— HostelConnect GH");
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendAgentApprovalEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Congratulations! Your Agent Account is Verified");
            msg.setText("Hello " + fullName + ",\n\n" +
                    "We are pleased to inform you that your agent account on HostelConnect GH has been verified.\n\n" +
                    "You can now start posting hostel listings and managing your profile.\n\n" +
                    "Welcome aboard!\n\n" +
                    "— HostelConnect GH Team");
            mailSender.send(msg);
            log.info("Approval email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send approval email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendAgentRejectionEmail(String toEmail, String fullName, String reason) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Update regarding your Agent Verification");
            msg.setText("Hello " + fullName + ",\n\n" +
                    "Thank you for your interest in becoming an agent on HostelConnect GH.\n\n" +
                    "Unfortunately, your verification request could not be approved at this time for the following reason:\n\n" +
                    "\"" + reason + "\"\n\n" +
                    "You can log in to your dashboard to update your information and resubmit for verification.\n\n" +
                    "— HostelConnect GH Team");
            mailSender.send(msg);
            log.info("Rejection email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send rejection email to {}: {}", toEmail, e.getMessage());
        }
    }
    @Async
    public void sendContactMessage(String name, String email, String subject, String message) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(fromEmail); // Send to admin
            msg.setReplyTo(email);
            msg.setSubject("Support Request: " + subject);
            msg.setText("Name: " + name + "\n" +
                    "Email: " + email + "\n\n" +
                    "Message:\n" + message);
            mailSender.send(msg);
            log.info("Support message from {} sent to admin.", email);
        } catch (Exception e) {
            log.warn("Failed to send support message from {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendTicketUpdateEmail(String toEmail, String name, String ticketId, String subject, String status, String response) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("Update regarding your Support Ticket: " + ticketId);
            msg.setText("Hello " + name + ",\n\n" +
                    "Your support ticket (" + ticketId + ") has been updated.\n\n" +
                    "Ticket Subject: " + subject + "\n" +
                    "New Status: " + status + "\n\n" +
                    "Admin Response:\n" + response + "\n\n" +
                    "You can track the progress of this ticket under the 'Ticket History' tab on our Support page.\n\n" +
                    "— HostelConnect GH Team");
            mailSender.send(msg);
            log.info("Ticket update email sent to: {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send ticket update email to {}: {}", toEmail, e.getMessage());
        }
    }
}
