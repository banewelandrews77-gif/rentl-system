package gh.hostelconnect.controller;

import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.support.ContactRequest;
import gh.hostelconnect.dto.support.SupportTicketResponse;
import gh.hostelconnect.repository.UserRepository;
import gh.hostelconnect.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@CrossOrigin
public class SupportController {

    private final SupportTicketService supportTicketService;
    private final UserRepository userRepository;

    @PostMapping("/contact")
    public ResponseEntity<SupportTicketResponse> handleContactForm(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(supportTicketService.createTicket(request));
    }

    @GetMapping("/tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(supportTicketService.getTicketsByEmail(user.getEmail()));
    }
}
