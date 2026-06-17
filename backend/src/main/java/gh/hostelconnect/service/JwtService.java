package gh.hostelconnect.service;

import gh.hostelconnect.config.AppProperties;
import gh.hostelconnect.domain.AgentProfile;
import gh.hostelconnect.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final AppProperties app;

    public String createToken(User user, AgentProfile agentProfile) {
        AppProperties.Jwt jwt = app.getJwt();
        SecretKey key = Keys.hmacShaKeyFor(jwt.getSecret().getBytes(StandardCharsets.UTF_8));
        long now = System.currentTimeMillis();
        String verificationStatus = agentProfile != null
            ? agentProfile.getVerificationStatus().name()
            : null;
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .claim("verificationStatus", verificationStatus)
            .issuer(jwt.getIssuer())
            .issuedAt(new Date(now))
            .expiration(new Date(now + jwt.getExpirationMs()))
            .signWith(key)
            .compact();
    }

    public record Claims(UUID userId, String email, String role, String verificationStatus) {}

    public Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(app.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
        io.jsonwebtoken.Claims payload = Jwts.parser()
            .verifyWith(key)
            .requireIssuer(app.getJwt().getIssuer())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return new Claims(
            UUID.fromString(payload.getSubject()),
            payload.get("email", String.class),
            payload.get("role", String.class),
            payload.get("verificationStatus", String.class)
        );
    }
}
