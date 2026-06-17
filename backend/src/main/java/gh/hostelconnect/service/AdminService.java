package gh.hostelconnect.service;

import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.Hostel;
import gh.hostelconnect.domain.User;
import gh.hostelconnect.dto.admin.AdminDashboardResponse;
import gh.hostelconnect.dto.admin.AgentProfileAdminResponse;
import gh.hostelconnect.dto.hostel.HostelResponse;
import gh.hostelconnect.repository.AgentProfileRepository;
import gh.hostelconnect.repository.HostelRepository;
import gh.hostelconnect.repository.UserRepository;
import gh.hostelconnect.repository.InquiryRepository;
import gh.hostelconnect.repository.ReservationRepository;
import gh.hostelconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AgentProfileRepository agentProfileRepository;
    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final EmailService emailService;
    private final HostelService hostelService;
    private final ReservationRepository reservationRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;

    @Transactional(readOnly = true)
    public List<AgentProfileAdminResponse> getPendingAgents() {
        return agentProfileRepository.findByVerificationStatus(AgentProfile.VerificationStatus.PENDING)
                .stream()
                .map(AgentProfileAdminResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void verifyAgent(UUID agentId) {
        AgentProfile profile = agentProfileRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));

        profile.setVerificationStatus(AgentProfile.VerificationStatus.VERIFIED);
        profile.setRejectionReason(null);
        agentProfileRepository.save(profile);
        
        emailService.sendAgentApprovalEmail(profile.getUser().getEmail(), profile.getUser().getFullName());
    }

    @Transactional
    public void rejectAgent(UUID agentId, String reason) {
        AgentProfile profile = agentProfileRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent profile not found"));

        profile.setVerificationStatus(AgentProfile.VerificationStatus.REJECTED);
        profile.setRejectionReason(reason);
        agentProfileRepository.save(profile);

        emailService.sendAgentRejectionEmail(profile.getUser().getEmail(), profile.getUser().getFullName(), reason);
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalAgents = userRepository.countByRole(User.Role.AGENT);
        long totalHostels = hostelRepository.count();
        long pendingVerifications = agentProfileRepository
                .countByVerificationStatus(AgentProfile.VerificationStatus.PENDING);

        return new AdminDashboardResponse(totalCustomers, totalAgents, totalHostels, pendingVerifications);
    }

    @Transactional(readOnly = true)
    public List<User> getAllCustomers() {
        return userRepository.findByRoleOrderByFullNameAsc(User.Role.CUSTOMER);
    }

    @Transactional(readOnly = true)
    public List<User> getAllAgents() {
        return userRepository.findByRoleOrderByFullNameAsc(User.Role.AGENT);
    }

    @Transactional(readOnly = true)
    public List<HostelResponse> getHostels() {
        return hostelService.getAllHostelsForAdmin();
    }

    @Transactional
    public void deleteHostel(UUID hostelId) {
        hostelRepository.deleteById(hostelId);
    }

    @Transactional
    public gh.hostelconnect.dto.hostel.HostelResponse updateHostel(UUID id, gh.hostelconnect.dto.hostel.UpdateHostelRequest request) {
        return hostelService.updateHostel(null, true, id, request);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Remove any customer-level activity globally (In case an agent booked as a customer)
        reservationRepository.deleteByCustomer_Id(userId);
        reviewRepository.deleteByCustomer_Id(userId);
        inquiryRepository.deleteByCustomer_Id(userId);

        if (user.getRole() == User.Role.AGENT) {
            if (user.getAgentProfile() != null) {
                List<Hostel> agentHostels = hostelRepository.findByAgentId(user.getAgentProfile().getId());
                for (Hostel hostel : agentHostels) {
                    reservationRepository.deleteByHostel_Id(hostel.getId());
                    reviewRepository.deleteByHostelId(hostel.getId());
                    inquiryRepository.deleteByHostel_Id(hostel.getId());
                    hostelRepository.deleteById(hostel.getId());
                }
            }
        }
        
        userRepository.delete(user);
    }
}
