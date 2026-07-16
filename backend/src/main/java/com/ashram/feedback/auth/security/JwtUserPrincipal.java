package com.ashram.feedback.auth.security;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Custom principal stored in the SecurityContext after JWT authentication.
 * Provides convenient access to user identity details across the application.
 */
@Data
@AllArgsConstructor
public class JwtUserPrincipal {

    private Long userId;
    private String subject;     // email for admin, residentCode for resident
    private String name;
    private String userType;    // "ADMIN" or "RESIDENT"
    private Long campId;        // only for residents

    public boolean isAdmin() {
        return "ADMIN".equals(userType);
    }

    public boolean isResident() {
        return "RESIDENT".equals(userType);
    }
}
