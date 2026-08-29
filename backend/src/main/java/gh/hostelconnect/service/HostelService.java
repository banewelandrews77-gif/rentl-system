package gh.hostelconnect.service;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.domain.HostelImage;
import gh.hostelconnect.domain.RoomType;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.hostel.CreateHostelRequest;
import gh.hostelconnect.dto.hostel.UpdateHostelRequest;
import gh.hostelconnect.dto.hostel.CreateRoomTypeRequest;
import gh.hostelconnect.dto.hostel.HostelResponse;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.HostelImageRepository;
import gh.hostelconnect.repository.HostelRepository;
import gh.hostelconnect.repository.InquiryRepository;
import gh.hostelconnect.repository.ReservationRepository;
import gh.hostelconnect.repository.ReviewRepository;
import gh.hostelconnect.repository.RoomTypeRepository;
import gh.hostelconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HostelService {

    private final HostelRepository hostelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final HostelImageRepository hostelImageRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final ReservationRepository reservationRepository;
    private final FileStorageService fileStorageService;
    private final ReservationService reservationService;

    private HostelResponse mapWithReviews(Hostel hostel) {
        HostelResponse response = HostelResponse.fromEntity(hostel);
        Double avgRating = reviewRepository.getAverageRatingForHostel(hostel.getId());
        Long count = reviewRepository.countByHostelId(hostel.getId());

        // Handle null if there are no reviews yet
        response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.setReviewCount(count);
        return response;
    }

    @Transactional
    public HostelResponse createHostel(UUID userId, CreateHostelRequest request) {
        AgentProfile agentInfo = getVerifiedAgentOrThrow(userId);

        Hostel hostel = Hostel.builder()
                .agent(agentInfo)
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .gpsCoordinates(request.getGpsCoordinates())
                .schoolSlug(request.getSchoolSlug())
                .status(Hostel.Status.DRAFT)
                .build();

        Hostel savedHostel = hostelRepository.save(hostel);
        return getHostel(savedHostel.getId());
    }

    @Transactional
    public HostelResponse updateHostelStatus(UUID userId, UUID hostelId, Hostel.Status newStatus) {
        Hostel hostel = getHostelForAgentOrThrow(userId, hostelId);
        hostel.setStatus(newStatus);
        return mapWithReviews(hostelRepository.save(hostel));
    }

    @Transactional
    public HostelResponse updateHostel(UUID requesterId, boolean isAdmin, UUID hostelId, UpdateHostelRequest request) {
        Hostel hostel;
        if (isAdmin) {
            hostel = hostelRepository.findById(hostelId)
                    .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
        } else {
            hostel = getHostelForAgentOrThrow(requesterId, hostelId);
        }

        hostel.setName(request.getName());
        hostel.setDescription(request.getDescription());
        hostel.setLocation(request.getLocation());
        hostel.setGpsCoordinates(request.getGpsCoordinates());
        hostel.setSchoolSlug(request.getSchoolSlug());

        return mapWithReviews(hostelRepository.save(hostel));
    }

    @Transactional
    public void deleteHostel(UUID requesterId, boolean isAdmin, UUID hostelId) {
        Hostel hostel;
        if (!isAdmin) {
            hostel = getHostelForAgentOrThrow(requesterId, hostelId);
        } else {
            hostel = hostelRepository.findById(hostelId)
                    .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
        }

        // Delete all dependent records first to avoid constraint violations
        inquiryRepository.deleteByHostel_Id(hostelId);
        reviewRepository.deleteByHostelId(hostelId);
        reservationRepository.deleteByHostel_Id(hostelId);

        // Cleanup images from disk
        hostel.getImages().forEach(img -> {
            String fileName = img.getImageUrl().substring(img.getImageUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(fileName);
        });

        hostelRepository.delete(hostel);
    }

    @Transactional
    public HostelResponse addRoomType(UUID userId, UUID hostelId, CreateRoomTypeRequest request) {
        Hostel hostel = getHostelForAgentOrThrow(userId, hostelId);

        RoomType roomType = RoomType.builder()
                .hostel(hostel)
                .name(request.getName())
                .capacity(request.getCapacity())
                .pricePerYear(request.getPricePerYear())
                .totalAvailable(request.getTotalAvailable())
                .availableCount(request.getTotalAvailable())
                .build();

        roomTypeRepository.save(roomType);

        // Refresh hostel
        return mapWithReviews(hostelRepository.findById(hostelId).get());
    }

    @Transactional
    public HostelResponse uploadHostelImage(UUID userId, UUID hostelId, MultipartFile file, boolean isPrimary) {
        Hostel hostel = getHostelForAgentOrThrow(userId, hostelId);

        String fileName = fileStorageService.storeFile(file);
        String fileDownloadUri = fileName.startsWith("http") ? fileName : "/api/files/" + fileName;

        // If this is set as primary, un-primary others
        if (isPrimary) {
            hostel.getImages().forEach(img -> img.setPrimary(false));
            hostelImageRepository.saveAll(hostel.getImages());
        } else if (hostel.getImages().isEmpty()) {
            isPrimary = true; // First image is always primary
        }

        HostelImage hostelImage = HostelImage.builder()
                .hostel(hostel)
                .imageUrl(fileDownloadUri)
                .isPrimary(isPrimary)
                .build();

        hostelImageRepository.save(hostelImage);

        return mapWithReviews(hostelRepository.findById(hostelId).get());
    }

    @Transactional
    public HostelResponse uploadRoomImage(UUID userId, UUID hostelId, UUID roomTypeId, MultipartFile file) {
        Hostel hostel = getHostelForAgentOrThrow(userId, hostelId);
        
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Room type not found"));
                
        if (!roomType.getHostel().getId().equals(hostelId)) {
            throw new IllegalArgumentException("Room type does not belong to this hostel");
        }

        // Cleanup old image if exists
        if (roomType.getImageUrl() != null) {
            String oldFileName = roomType.getImageUrl().substring(roomType.getImageUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(oldFileName);
        }

        String fileName = fileStorageService.storeFile(file);
        String fileDownloadUri = fileName.startsWith("http") ? fileName : "/api/files/" + fileName;
        
        roomType.setImageUrl(fileDownloadUri);
        roomTypeRepository.save(roomType);

        return mapWithReviews(hostelRepository.findById(hostelId).get());
    }

    @Transactional
    public HostelResponse deleteHostelImage(UUID userId, UUID hostelId, UUID imageId) {
        Hostel hostel = getHostelForAgentOrThrow(userId, hostelId);
        
        HostelImage image = hostelImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Image not found"));
                
        if (!image.getHostel().getId().equals(hostelId)) {
            throw new IllegalArgumentException("Image does not belong to this hostel");
        }

        // Delete from disk
        String fileName = image.getImageUrl().substring(image.getImageUrl().lastIndexOf("/") + 1);
        fileStorageService.deleteFile(fileName);

        boolean wasPrimary = image.isPrimary();
        hostelImageRepository.delete(image);
        
        // If we deleted the primary image, make another one primary if available
        if (wasPrimary) {
            List<HostelImage> remaining = hostelImageRepository.findByHostelId(hostelId);
            if (!remaining.isEmpty()) {
                HostelImage newPrimary = remaining.get(0);
                newPrimary.setPrimary(true);
                hostelImageRepository.save(newPrimary);
            }
        }

        return mapWithReviews(hostelRepository.findById(hostelId).get());
    }

    @Transactional
    public List<HostelResponse> getAgentHostels(UUID userId) {
        reservationService.cleanupExpiredReservations();
        var profileOpt = agentProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return List.of();
        }

        List<Hostel> hostels = hostelRepository.findByAgentId(profileOpt.get().getId());
        return mapHostelsWithBulkReviews(hostels);
    }

    @Transactional
    public HostelResponse getHostel(UUID hostelId) {
        reservationService.cleanupExpiredReservations();
        return hostelRepository.findById(hostelId)
                .map(this::mapWithReviews)
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));
    }

    @Transactional
    public List<HostelResponse> getAllPublishedHostels() {
        reservationService.cleanupExpiredReservations();
        List<Hostel> hostels = hostelRepository.findByStatus(Hostel.Status.PUBLISHED);
        return mapHostelsWithBulkReviews(hostels);
    }

    @Transactional
    public List<HostelResponse> getAllHostelsForAdmin() {
        reservationService.cleanupExpiredReservations();
        List<Hostel> hostels = hostelRepository.findAll();
        return mapHostelsWithBulkReviews(hostels);
    }

    private List<HostelResponse> mapHostelsWithBulkReviews(List<Hostel> hostels) {
        if (hostels.isEmpty()) return List.of();
        
        List<UUID> hostelIds = hostels.stream().map(Hostel::getId).collect(Collectors.toList());
        List<Object[]> stats = reviewRepository.getReviewStatsForHostels(hostelIds);
        
        java.util.Map<UUID, Object[]> statsMap = stats.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> row
                ));
                
        return hostels.stream().map(hostel -> {
            HostelResponse response = HostelResponse.fromEntity(hostel);
            Object[] stat = statsMap.get(hostel.getId());
            if (stat != null) {
                Double avgRating = stat[1] != null ? ((Number) stat[1]).doubleValue() : 0.0;
                Long count = stat[2] != null ? ((Number) stat[2]).longValue() : 0L;
                response.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
                response.setReviewCount(count);
            } else {
                response.setAverageRating(0.0);
                response.setReviewCount(0L);
            }
            return response;
        }).collect(Collectors.toList());
    }

    private AgentProfile getVerifiedAgentOrThrow(UUID userId) {
        AgentProfile profile = agentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    if (user.getRole() == User.Role.ADMIN) {
                        return agentProfileRepository.save(AgentProfile.builder()
                                .user(user)
                                .verificationStatus(AgentProfile.VerificationStatus.VERIFIED)
                                .subscriptionValidUntil(Instant.now().plus(365, ChronoUnit.DAYS))
                                .submissionCount(0)
                                .build());
                    }
                    throw new IllegalArgumentException("Agent profile not found");
                });

        if (profile.getUser().getRole() == User.Role.ADMIN) {
            return profile;
        }

        if (profile.getVerificationStatus() != AgentProfile.VerificationStatus.VERIFIED) {
            throw new IllegalStateException("Only verified agents can manage hostels");
        }

        if (profile.getSubscriptionValidUntil() == null
                || profile.getSubscriptionValidUntil().isBefore(Instant.now())) {
            throw new IllegalStateException("An active subscription is required to manage hostels.");
        }

        return profile;
    }

    private Hostel getHostelForAgentOrThrow(UUID userId, UUID hostelId) {
        AgentProfile profile = getVerifiedAgentOrThrow(userId);
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new IllegalArgumentException("Hostel not found"));

        if (!hostel.getAgent().getId().equals(profile.getId())) {
            throw new IllegalStateException("You do not have permission to modify this hostel");
        }
        return hostel;
    }
}
