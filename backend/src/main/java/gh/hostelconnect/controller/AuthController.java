package gh.hostelconnect.controller;

import gh.hostelconnect.dto.auth.*;
import gh.hostelconnect.service.AuthService;
import gh.hostelconnect.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register/customer")
    public ResponseEntity<AuthResponse> registerCustomer(@Valid @RequestBody RegisterCustomerRequest request) {
        AuthResponse response = authService.registerCustomer(request);
         return ResponseEntity.ok(response);
    }

    @PostMapping("/register/agent")
    public ResponseEntity<AuthResponse> registerAgent(@Valid @RequestBody RegisterAgentRequest request) {
        AuthResponse response = authService.registerAgent(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "A new verification code has been sent."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity
                .ok(Map.of("message", "If an account exists with this email, you will receive a password reset code."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        AuthResponse response = authService.getMe(userId);
        return ResponseEntity.ok(response);
    }
}
