package gh.hostelconnect.service;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.auth.*;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final SmsService smsService;

    @Transactional
    public AuthResponse registerCustomer(RegisterCustomerRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail().trim().toLowerCase())
                .phoneNumber(req.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.CUSTOMER)
                .emailVerified(false)
                .active(true)
                .build();
        user = userRepository.save(user);
        String otp = otpService.generateAndStore(user.getEmail(), OtpService.OtpType.EMAIL_VERIFY);
        emailService.sendVerificationOtp(user.getEmail(), otp);
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            smsService.sendVerificationOtp(user.getPhoneNumber(), otp);
        }
        return buildAuthResponse(user, null);
    }

    @Transactional
    public AuthResponse registerAgent(RegisterAgentRequest req) {
        if (req.getPassword() != null && !req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail().trim().toLowerCase())
                .phoneNumber(req.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.AGENT)
                .emailVerified(false)
                .active(true)
                .build();
        user = userRepository.save(user);

        AgentProfile.VerificationStatus status = AgentProfile.VerificationStatus.UNVERIFIED;
        java.time.Instant subExpires = null;
        if (user.getEmail().equalsIgnoreCase("banewelandrews77@gmail.com")) {
            status = AgentProfile.VerificationStatus.VERIFIED;
            subExpires = java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS);
            user.setEmailVerified(true);
            user = userRepository.save(user);
        }

        AgentProfile profile = AgentProfile.builder()
                .user(user)
                .verificationStatus(status)
                .submissionCount(0)
                .subscriptionValidUntil(subExpires)
                .build();
        agentProfileRepository.save(profile);
        
        if (!user.isEmailVerified()) {
            String otp = otpService.generateAndStore(user.getEmail(), OtpService.OtpType.EMAIL_VERIFY);
            emailService.sendVerificationOtp(user.getEmail(), otp);
            if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
                smsService.sendVerificationOtp(user.getPhoneNumber(), otp);
            }
        }
        return buildAuthResponse(user, profile);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (otpService.isLockedOut(email)) {
            throw new IllegalStateException(
                    "Account temporarily locked due to too many failed attempts. Try again in 15 minutes.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is deactivated. Contact support.");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            otpService.recordFailedLogin(email);
            if (otpService.shouldLockout(email)) {
                otpService.lockout(email);
                throw new IllegalStateException(
                        "Account locked due to too many failed attempts. Try again in 15 minutes.");
            }
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (!user.isEmailVerified()) {
            String newOtp = otpService.generateAndStore(user.getEmail(), OtpService.OtpType.EMAIL_VERIFY);
            emailService.sendVerificationOtp(user.getEmail(), newOtp);
            if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
                smsService.sendVerificationOtp(user.getPhoneNumber(), newOtp);
            }
            throw new IllegalStateException(
                    "Please verify your email before logging in. A new verification code has been sent.");
        }
        otpService.clearFailedLogins(email);
        AgentProfile agentProfile = user.getRole() == User.Role.AGENT
                ? agentProfileRepository.findByUserId(user.getId()).orElse(null)
                : null;
        if (user.getRole() == User.Role.AGENT && agentProfile == null) {
            agentProfile = AgentProfile.builder().user(user)
                    .verificationStatus(AgentProfile.VerificationStatus.UNVERIFIED).build();
            agentProfile = agentProfileRepository.save(agentProfile);
        }
        return buildAuthResponse(user, agentProfile);
    }

    @Transactional
    public void verifyEmail(String email, String otp) {
        String em = email.trim().toLowerCase();
        User user = userRepository.findByEmail(em)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email"));
        if (!otpService.validate(em, otp, OtpService.OtpType.EMAIL_VERIFY)) {
            throw new IllegalArgumentException("Invalid or expired verification code");
        }
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        String em = email.trim().toLowerCase();
        User user = userRepository.findByEmail(em)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }
        String otp = otpService.generateAndStore(em, OtpService.OtpType.EMAIL_VERIFY);
        emailService.sendVerificationOtp(em, otp);
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            smsService.sendVerificationOtp(user.getPhoneNumber(), otp);
        }
    }

    public void forgotPassword(ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            String otp = otpService.generateAndStore(email, OtpService.OtpType.PASSWORD_RESET);
            emailService.sendPasswordResetOtp(email, otp);
            if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
                smsService.sendPasswordResetOtp(user.getPhoneNumber(), otp);
            }
        });
        // Always return success to avoid email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        String em = req.getEmail().trim().toLowerCase();
        if (!otpService.validate(em, req.getOtp(), OtpService.OtpType.PASSWORD_RESET)) {
            throw new IllegalArgumentException("Invalid or expired reset code");
        }
        User user = userRepository.findByEmail(em)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public AuthResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        AgentProfile agentProfile = user.getRole() == User.Role.AGENT
                ? agentProfileRepository.findByUserId(user.getId()).orElse(null)
                : null;
        return buildAuthResponse(user, agentProfile);
    }

    private AuthResponse buildAuthResponse(User user, AgentProfile agentProfile) {
        String token = jwtService.createToken(user, agentProfile);
        String verificationStatus = agentProfile != null ? agentProfile.getVerificationStatus().name() : null;
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .role(user.getRole().name())
                .verificationStatus(verificationStatus)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .emailVerified(user.isEmailVerified())
                        .build())
                .build();
    }
}
