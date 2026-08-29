package gh.hostelconnect.dto.hostel;

import gh.hostelconnect.domain.Hostel;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HostelResponse {
    private UUID id;
    private String name;
    private String description;
    private String location;
    private String gpsCoordinates;
    private String schoolSlug;
    private String status;
    private String agentName;
    private String agentPhone;
    private Double averageRating;
    private Long reviewCount;
    private List<RoomTypeDto> roomTypes;
    private List<HostelImageDto> images;

    @Data
    @Builder
    public static class RoomTypeDto {
        private UUID id;
        private String name;
        private int capacity;
        private BigDecimal pricePerYear;
        private int totalAvailable;
        private int availableCount;
        private String imageUrl;
    }

    @Data
    @Builder
    public static class HostelImageDto {
        private UUID id;
        private String imageUrl;
        private boolean isPrimary;
    }

    public static HostelResponse fromEntity(Hostel hostel) {
        String agentName = "Unknown Agent";
        String agentPhone = "N/A";
        
        if (hostel.getAgent() != null && hostel.getAgent().getUser() != null) {
            agentName = hostel.getAgent().getUser().getFullName();
            agentPhone = hostel.getAgent().getUser().getPhoneNumber();
        }

        return HostelResponse.builder()
                .id(hostel.getId())
                .name(hostel.getName())
                .description(hostel.getDescription())
                .location(hostel.getLocation())
                .gpsCoordinates(hostel.getGpsCoordinates())
                .schoolSlug(hostel.getSchoolSlug())
                .status(hostel.getStatus() != null ? hostel.getStatus().name() : null)
                .agentName(agentName)
                .agentPhone(agentPhone)
                .roomTypes(hostel.getRoomTypes().stream().map(rt -> RoomTypeDto.builder()
                        .id(rt.getId())
                        .name(rt.getName())
                        .capacity(rt.getCapacity())
                        .pricePerYear(rt.getPricePerYear())
                        .totalAvailable(rt.getTotalAvailable())
                        .availableCount(rt.getAvailableCount())
                        .imageUrl(rt.getImageUrl())
                        .build()).collect(Collectors.toList()))
                .images(hostel.getImages().stream().map(img -> HostelImageDto.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.isPrimary())
                        .build()).collect(Collectors.toList()))
                .averageRating(null) // These will be filled by the service layer
                .reviewCount(0L)
                .build();
    }
}
