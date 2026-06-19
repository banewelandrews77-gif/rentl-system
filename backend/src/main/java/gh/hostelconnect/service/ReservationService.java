package gh.hostelconnect.service;

import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.domain.Reservation;
import gh.hostelconnect.domain.ReservationStatus;
import gh.hostelconnect.domain.RoomType;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.reservation.CreateReservationRequest;
import gh.hostelconnect.dto.reservation.InitializePaymentResponse;
import gh.hostelconnect.dto.reservation.ReservationResponse;
import gh.hostelconnect.repository.HostelRepository;
import gh.hostelconnect.repository.ReservationRepository;
import gh.hostelconnect.repository.RoomTypeRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final PaystackService paystackService;
    private final ReceiptService receiptService;

    @Value("${app.frontend.url:https://rentl-system.vercel.app}")
    private String frontendUrl;

    @Transactional
    public ReservationResponse createReservation(UUID customerId, CreateReservationRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Hostel hostel = hostelRepository.findById(request.hostelId())
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));

        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Room type not found"));

        if (!roomType.getHostel().getId().equals(hostel.getId())) {
            throw new IllegalArgumentException("Room type does not belong to this hostel");
        }

        if (roomType.getAvailableCount() <= 0) {
            throw new IllegalStateException("No available beds for this room type.");
        }

        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        // Deduct bed availability immediately (simple reservation logic)
        roomType.setAvailableCount(roomType.getAvailableCount() - 1);
        roomTypeRepository.save(roomType);

        Reservation reservation = Reservation.builder()
                .customer(customer)
                .hostel(hostel)
                .roomType(roomType)
                .status(ReservationStatus.PENDING_PAYMENT)
                .amountPaid(roomType.getPricePerYear().add(new java.math.BigDecimal("20.00"))) // Room annual fee + GHS 20.00 site reservation fee
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();

        return mapToResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public InitializePaymentResponse initializePayment(UUID customerId, UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Reservation does not belong to this customer");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Reservation is not pending payment");
        }

        // Ensure the 20 GHS site reservation fee is included in the payment amount
        java.math.BigDecimal expectedAmount = reservation.getRoomType().getPricePerYear().add(new java.math.BigDecimal("20.00"));
        if (reservation.getAmountPaid() == null || reservation.getAmountPaid().compareTo(expectedAmount) != 0) {
            reservation.setAmountPaid(expectedAmount);
        }

        String reference = "RES_" + reservationId.toString() + "_" + System.currentTimeMillis();
        reservation.setPaymentReference(reference);
        reservationRepository.save(reservation);

        return paystackService.initializeTransaction(reservation.getCustomer().getEmail(), reservation.getAmountPaid(),
                reference, frontendUrl + "/payment/callback", reservation.getCustomer().getPhoneNumber());
    }

    @Transactional
    public void cleanupExpiredReservations() {
        log.info("Running expired reservation cleanup...");
        java.time.Instant threshold = java.time.Instant.now().minus(72, java.time.temporal.ChronoUnit.HOURS);
        
        List<Reservation> expiredReservations = reservationRepository
                .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING_PAYMENT, threshold);

        if (expiredReservations.isEmpty()) {
            log.info("No expired reservations found.");
            return;
        }

        log.info("Found {} expired reservations to cancel.", expiredReservations.size());
        for (Reservation reservation : expiredReservations) {
            try {
                reservation.setStatus(ReservationStatus.CANCELLED);
                
                RoomType roomType = reservation.getRoomType();
                if (roomType != null) {
                    roomType.setAvailableCount(roomType.getAvailableCount() + 1);
                    roomTypeRepository.save(roomType);
                    log.info("Released 1 bed for room type: {} in hostel: {} for cancelled reservation: {}", 
                            roomType.getName(), reservation.getHostel().getName(), reservation.getId());
                }
                
                reservationRepository.save(reservation);
                log.info("Cancelled expired reservation: {}", reservation.getId());
            } catch (Exception e) {
                log.error("Failed to clean up reservation: {}", reservation.getId(), e);
            }
        }
    }

    @Transactional
    public List<ReservationResponse> getCustomerReservations(UUID customerId) {
        cleanupExpiredReservations();
        return reservationRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public List<ReservationResponse> getHostelReservations(UUID hostelId) {
        cleanupExpiredReservations();
        return reservationRepository.findByHostel_IdOrderByCreatedAtDesc(hostelId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream generateReceipt(UUID reservationId, UUID customerId) {
        log.info("Generating receipt for reservation: {} (Using EntityGraph fetch)", reservationId);
        Reservation reservation = reservationRepository.findByIdFull(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("Reservation does not belong to this customer");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED && reservation.getStatus() != ReservationStatus.COMPLETED) {
            throw new IllegalStateException("Receipt is only available for confirmed or completed bookings.");
        }

        return receiptService.generateReceipt(reservation);
    }

    @Transactional
    public void verifyPayment(String reference) {
        log.info("Verifying payment for reference: {}", reference);
        boolean isSuccess = paystackService.verifyTransaction(reference);

        if (isSuccess) {
            reservationRepository.findByPaymentReference(reference).ifPresent(reservation -> {
                if (reservation.getStatus() == ReservationStatus.PENDING_PAYMENT) {
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    reservationRepository.save(reservation);
                    log.info("Reservation {} status updated to CONFIRMED", reservation.getId());
                }
            });
        } else {
            log.warn("Payment verification failed for reference: {}", reference);
            throw new IllegalStateException("Payment verification failed with provider.");
        }
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .hostelId(reservation.getHostel().getId())
                .hostelName(reservation.getHostel().getName())
                .roomTypeId(reservation.getRoomType().getId())
                .roomTypeName(reservation.getRoomType().getName())
                .status(reservation.getStatus())
                .paymentReference(reservation.getPaymentReference())
                .amountPaid(reservation.getAmountPaid())
                .startDate(reservation.getStartDate())
                .endDate(reservation.getEndDate())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}
