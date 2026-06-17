package gh.hostelconnect.service;

import gh.hostelconnect.domain.SupportTicket;
import gh.hostelconnect.domain.TicketStatus;
import gh.hostelconnect.dto.support.ContactRequest;
import gh.hostelconnect.dto.support.RespondTicketRequest;
import gh.hostelconnect.dto.support.SupportTicketResponse;
import gh.hostelconnect.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final EmailService emailService;

    @Transactional
    public SupportTicketResponse createTicket(ContactRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .status(TicketStatus.SUBMITTED)
                .build();

        ticket = ticketRepository.save(ticket);

        // Send standard email to admin
        emailService.sendContactMessage(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
        );

        return mapToResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getTicketsByEmail(String email) {
        return ticketRepository.findByEmailOrderByCreatedAtDesc(email).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public SupportTicketResponse respondToTicket(UUID ticketId, RespondTicketRequest request) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found"));

        ticket.setStatus(request.getStatus());
        ticket.setAdminResponse(request.getResponse());
        ticket = ticketRepository.save(ticket);

        // Send update notification email to user
        emailService.sendTicketUpdateEmail(
                ticket.getEmail(),
                ticket.getName(),
                ticket.getId().toString(),
                ticket.getSubject(),
                ticket.getStatus().toString(),
                ticket.getAdminResponse()
        );

        return mapToResponse(ticket);
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .name(ticket.getName())
                .email(ticket.getEmail())
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .status(ticket.getStatus())
                .adminResponse(ticket.getAdminResponse())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
