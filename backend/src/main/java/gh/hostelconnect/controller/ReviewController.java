package gh.hostelconnect.controller;

import gh.hostelconnect.dto.review.CreateReviewRequest;
import gh.hostelconnect.dto.review.ReviewResponse;
import gh.hostelconnect.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/customers/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reviewService.createReview(customerId, request));
    }

    @GetMapping("/public/hostels/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getHostelReviews(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.getHostelReviews(id));
    }

    @GetMapping("/customers/reviews/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reviewService.getMyReviews(customerId));
    }

    @GetMapping("/agents/reviews")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<List<ReviewResponse>> getAgentReviews(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reviewService.getAgentReviews(userId));
    }

    @GetMapping("/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/admin/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
