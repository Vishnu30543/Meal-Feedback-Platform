package com.ashram.feedback.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long jwtExpirationMs;
    private final long adminExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs,
            @Value("${app.jwt.admin-expiration-ms}") long adminExpirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.jwtExpirationMs = jwtExpirationMs;
        this.adminExpirationMs = adminExpirationMs;
    }

    /**
     * Generate JWT token for admin login.
     */
    public String generateAdminToken(Long adminId, String email, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", adminId);
        claims.put("name", name);
        claims.put("role", "ROLE_ADMIN");
        claims.put("userType", "ADMIN");

        return buildToken(email, claims, adminExpirationMs);
    }

    /**
     * Generate JWT token for resident login.
     */
    public String generateResidentToken(Long residentId, Long campId,
                                         String residentCode, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", residentId);
        claims.put("campId", campId);
        claims.put("residentCode", residentCode);
        claims.put("name", name != null ? name : residentCode);
        claims.put("role", "ROLE_RESIDENT");
        claims.put("userType", "RESIDENT");

        return buildToken(residentCode, claims, jwtExpirationMs);
    }

    private String buildToken(String subject, Map<String, Object> claims, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getSubjectFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    public Long getUserIdFromToken(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    public Long getCampIdFromToken(String token) {
        return getClaims(token).get("campId", Long.class);
    }

    public String getUserTypeFromToken(String token) {
        return getClaims(token).get("userType", String.class);
    }

    public String getNameFromToken(String token) {
        return getClaims(token).get("name", String.class);
    }

    public long getExpirationMs(String role) {
        return "ROLE_ADMIN".equals(role) ? adminExpirationMs : jwtExpirationMs;
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
