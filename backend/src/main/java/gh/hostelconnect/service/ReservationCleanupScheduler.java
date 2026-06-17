package gh.hostelconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationCleanupScheduler {

    private final ReservationService reservationService;

    @Scheduled(cron = "${app.reservation.cleanup-cron:0 0 * * * *}") // Defaults to every hour
    public void cleanupExpiredReservations() {
        log.info("Scheduled task: Running expired reservation cleanup...");
        reservationService.cleanupExpiredReservations();
    }
}
