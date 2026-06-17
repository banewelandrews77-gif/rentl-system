package gh.hostelconnect.service;

import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.domain.Inquiry;
import gh.hostelconnect.domain.InquiryStatus;
import gh.hostelconnect.domain.Review;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.review.CreateReviewRequest;
import gh.hostelconnect.dto.review.ReviewResponse;
import gh.hostelconnect.domain.ReservationStatus;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.HostelRepository;
import gh.hostelconnect.repository.InquiryRepository;
import gh.hostelconnect.repository.ReservationRepository;
import gh.hostelconnect.repository.ReviewRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final InquiryRepository inquiryRepository;
    private final ReservationRepository reservationRepository;
    private final AgentProfileRepository agentProfileRepository;

    @Transactional
    public ReviewResponse createReview(UUID customerId, CreateReviewRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Hostel hostel = hostelRepository.findById(request.hostelId())
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));

        if (reviewRepository.existsByCustomer_IdAndHostel_Id(customerId, hostel.getId())) {
            throw new IllegalStateException("You have already reviewed this hostel.");
        }

        boolean hasApprovedInquiry = inquiryRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .anyMatch(inq -> inq.getHostel().getId().equals(hostel.getId())
                        && (inq.getStatus() == InquiryStatus.APPROVED || inq.getStatus() == InquiryStatus.PENDING));

        boolean hasValidReservation = reservationRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .anyMatch(res -> res.getHostel().getId().equals(hostel.getId())
                        && (res.getStatus() == ReservationStatus.CONFIRMED || res.getStatus() == ReservationStatus.COMPLETED));

        if (!hasApprovedInquiry && !hasValidReservation) {
            throw new IllegalStateException("You must have an inquiry or reservation with this hostel to leave a review.");
        }

        Review review = Review.builder()
                .customer(customer)
                .hostel(hostel)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getHostelReviews(UUID hostelId) {
        return reviewRepository.findByHostelIdOrderByCreatedAtDesc(hostelId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(UUID customerId) {
        return reviewRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAgentReviews(UUID userId) {
        var agentProfile = agentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));
        List<Hostel> agentHostels = hostelRepository.findByAgentId(agentProfile.getId());
        if (agentHostels.isEmpty()) return List.of();
        List<UUID> hostelIds = agentHostels.stream().map(Hostel::getId).toList();
        return reviewRepository.findByHostel_IdInOrderByCreatedAtDesc(hostelIds).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteReview(UUID reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new IllegalArgumentException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }

    private ReviewResponse mapToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getHostel().getId(),
                review.getHostel().getName(),
                review.getCustomer().getId(),
                review.getCustomer().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt());
    }
}
