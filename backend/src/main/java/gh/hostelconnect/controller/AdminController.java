package gh.hostelconnect.controller;

import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.admin.AdminDashboardResponse;
import gh.hostelconnect.dto.admin.AgentProfileAdminResponse;
import gh.hostelconnect.dto.hostel.HostelResponse;
import gh.hostelconnect.dto.hostel.UpdateHostelRequest;
import gh.hostelconnect.dto.support.RespondTicketRequest;
import gh.hostelconnect.dto.support.SupportTicketResponse;
import gh.hostelconnect.service.AdminService;
import gh.hostelconnect.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final SupportTicketService supportTicketService;

    @GetMapping("/agents/pending")
    public ResponseEntity<List<AgentProfileAdminResponse>> getPendingAgents() {
        return ResponseEntity.ok(adminService.getPendingAgents());
    }

    @PostMapping("/agents/{id}/verify")
    public ResponseEntity<Map<String, String>> verifyAgent(@PathVariable UUID id) {
        adminService.verifyAgent(id);
        return ResponseEntity.ok(Map.of("message", "Agent verified successfully"));
    }

    @PostMapping("/agents/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectAgent(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        adminService.rejectAgent(id, reason);
        return ResponseEntity.ok(Map.of("message", "Agent rejected successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardResponse> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/customers")
    public ResponseEntity<List<User>> getCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @GetMapping("/agents")
    public ResponseEntity<List<User>> getAgents() {
        return ResponseEntity.ok(adminService.getAllAgents());
    }

    @GetMapping("/hostels")
    public ResponseEntity<List<HostelResponse>> getHostels() {
        return ResponseEntity.ok(adminService.getHostels());
    }

    @DeleteMapping("/hostels/{id}")
    public ResponseEntity<Map<String, String>> deleteHostel(@PathVariable UUID id) {
        adminService.deleteHostel(id);
        return ResponseEntity.ok(Map.of("message", "Hostel deleted successfully"));
    }

    @PatchMapping("/hostels/{id}")
    public ResponseEntity<HostelResponse> updateHostel(
            @PathVariable UUID id,
            @RequestBody UpdateHostelRequest request) {
        return ResponseEntity.ok(adminService.updateHostel(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/support/tickets")
    public ResponseEntity<List<SupportTicketResponse>> getSupportTickets() {
        return ResponseEntity.ok(supportTicketService.getAllTickets());
    }

    @PostMapping("/support/tickets/{id}/respond")
    public ResponseEntity<SupportTicketResponse> respondToTicket(
            @PathVariable UUID id,
            @Valid @RequestBody RespondTicketRequest request) {
        return ResponseEntity.ok(supportTicketService.respondToTicket(id, request));
    }
}
