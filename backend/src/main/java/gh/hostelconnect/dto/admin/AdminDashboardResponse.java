package gh.hostelconnect.dto.admin;

public record AdminDashboardResponse(
        long totalCustomers,
        long totalAgents,
        long totalHostels,
        long pendingVerifications) {
}
