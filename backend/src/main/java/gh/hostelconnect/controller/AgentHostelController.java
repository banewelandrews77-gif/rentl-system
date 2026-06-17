package gh.hostelconnect.controller;

import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.dto.hostel.CreateHostelRequest;
import gh.hostelconnect.dto.hostel.UpdateHostelRequest;
import gh.hostelconnect.dto.hostel.CreateRoomTypeRequest;
import gh.hostelconnect.dto.hostel.HostelResponse;
import gh.hostelconnect.service.HostelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agents/hostels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENT')")
public class AgentHostelController {

    private final HostelService hostelService;

    @PostMapping
    public ResponseEntity<HostelResponse> createHostel(
            @Valid @RequestBody CreateHostelRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.createHostel(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<HostelResponse>> getMyHostels(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.getAgentHostels(userId));
    }

    @PostMapping("/{hostelId}/rooms")
    public ResponseEntity<HostelResponse> addRoomType(
            @PathVariable UUID hostelId,
            @Valid @RequestBody CreateRoomTypeRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.addRoomType(userId, hostelId, request));
    }

    @PostMapping("/{hostelId}/images")
    public ResponseEntity<HostelResponse> uploadImage(
            @PathVariable UUID hostelId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.uploadHostelImage(userId, hostelId, file, isPrimary));
    }

    @PostMapping("/{hostelId}/rooms/{roomId}/image")
    public ResponseEntity<HostelResponse> uploadRoomImage(
            @PathVariable UUID hostelId,
            @PathVariable UUID roomId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.uploadRoomImage(userId, hostelId, roomId, file));
    }

    @DeleteMapping("/{hostelId}/images/{imageId}")
    public ResponseEntity<HostelResponse> deleteImage(
            @PathVariable UUID hostelId,
            @PathVariable UUID imageId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.deleteHostelImage(userId, hostelId, imageId));
    }

    @PatchMapping("/{hostelId}/status")
    public ResponseEntity<HostelResponse> updateStatus(
            @PathVariable UUID hostelId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        Hostel.Status newStatus = Hostel.Status.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(hostelService.updateHostelStatus(userId, hostelId, newStatus));
    }

    @PatchMapping("/{hostelId}")
    public ResponseEntity<HostelResponse> updateHostel(
            @PathVariable UUID hostelId,
            @Valid @RequestBody UpdateHostelRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(hostelService.updateHostel(userId, false, hostelId, request));
    }

    @DeleteMapping("/{hostelId}")
    public ResponseEntity<Map<String, String>> deleteHostel(
            @PathVariable UUID hostelId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        hostelService.deleteHostel(userId, false, hostelId);
        return ResponseEntity.ok(Map.of("message", "Hostel deleted successfully"));
    }
}
