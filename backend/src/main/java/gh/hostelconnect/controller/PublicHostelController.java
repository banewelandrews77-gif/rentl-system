package gh.hostelconnect.controller;

import gh.hostelconnect.dto.hostel.HostelResponse;
import gh.hostelconnect.service.HostelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/hostels")
@RequiredArgsConstructor
public class PublicHostelController {

    private final HostelService hostelService;

    @GetMapping
    public ResponseEntity<List<HostelResponse>> getAllPublishedHostels() {
        return ResponseEntity.ok(hostelService.getAllPublishedHostels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HostelResponse> getHostel(@PathVariable UUID id) {
        return ResponseEntity.ok(hostelService.getHostel(id));
    }
}
