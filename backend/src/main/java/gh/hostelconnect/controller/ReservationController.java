package gh.hostelconnect.controller;

import gh.hostelconnect.dto.reservation.CreateReservationRequest;
import gh.hostelconnect.dto.reservation.InitializePaymentResponse;
import gh.hostelconnect.dto.reservation.ReservationResponse;
import gh.hostelconnect.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.InputStreamResource;

import java.io.ByteArrayInputStream;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/customers/reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reservationService.createReservation(customerId, request));
    }

    @GetMapping("/customers/reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reservationService.getCustomerReservations(customerId));
    }

    @PostMapping("/customers/reservations/{id}/initialize-payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<InitializePaymentResponse> initializePayment(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reservationService.initializePayment(customerId, id));
    }

    @GetMapping("/agents/hostels/{id}/reservations")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<ReservationResponse>> getHostelReservations(@PathVariable UUID id) {
        // Simple implementation, ideally checking if the agent actually owns this
        // hostel
        return ResponseEntity.ok(reservationService.getHostelReservations(id));
    }

    @GetMapping("/customers/reservations/{id}/invoice")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<InputStreamResource> downloadInvoice(@PathVariable UUID id, Authentication authentication) {
        log.info("Invoice download requested for reservation: {}", id);
        UUID customerId = UUID.fromString(authentication.getName());
        try {
            ByteArrayInputStream bis = reservationService.generateReceipt(id, customerId);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "inline; filename=invoice_" + id + ".pdf");

            log.info("Invoice generated successfully for reservation: {}", id);
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(bis));
        } catch (Exception e) {
            log.error("Failed to generate invoice for reservation: {}", id, e);
            throw e;
        }
    }

    @PostMapping("/customers/reservations/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody Map<String, String> body) {
        String reference = body.get("reference");
        if (reference == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reference is required"));
        }
        reservationService.verifyPayment(reference);
        return ResponseEntity.ok(Map.of("message", "Payment verified successfully"));
    }
}
