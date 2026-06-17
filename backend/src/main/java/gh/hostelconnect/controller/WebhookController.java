package gh.hostelconnect.controller;

import gh.hostelconnect.domain.Reservation;
import gh.hostelconnect.domain.ReservationStatus;
import gh.hostelconnect.repository.ReservationRepository;
import gh.hostelconnect.service.PaystackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final PaystackService paystackService;
    private final ReservationRepository reservationRepository;

    @PostMapping("/paystack")
    public ResponseEntity<Void> handlePaystackWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received Paystack webhook: {}", payload);

        String event = (String) payload.get("event");
        if ("charge.success".equals(event)) {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            String reference = (String) data.get("reference");

            // Validate the transaction with Paystack to be secure
            if (paystackService.verifyTransaction(reference)) {
                Optional<Reservation> reservationOpt = reservationRepository.findByPaymentReference(reference);

                if (reservationOpt.isPresent()) {
                    Reservation reservation = reservationOpt.get();
                    if (reservation.getStatus() == ReservationStatus.PENDING_PAYMENT) {
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                        reservationRepository.save(reservation);
                        log.info("Reservation {} confirmed via Paystack webhook", reservation.getId());
                    }
                } else {
                    log.warn("Received successful webhook for unknown reference: {}", reference);
                }
            } else {
                log.warn("Paystack webhook received but transaction verification failed for reference: {}", reference);
            }
        }

        return ResponseEntity.ok().build();
    }
}
