package com.ashram.feedback.auth.service;

import com.ashram.feedback.auth.dto.AdminLoginRequest;
import com.ashram.feedback.auth.dto.AuthResponse;
import com.ashram.feedback.auth.dto.ResidentLoginRequest;
import com.ashram.feedback.auth.entity.Admin;
import com.ashram.feedback.auth.repository.AdminRepository;
import com.ashram.feedback.auth.security.JwtTokenProvider;
import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.exception.BusinessException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.resident.entity.Camp;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.repository.CampRepository;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final ResidentRepository residentRepository;
    private final CampRepository campRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Authenticate admin with email and password.
     */
    public AuthResponse loginAdmin(AdminLoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtTokenProvider.generateAdminToken(
                admin.getId(), admin.getEmail(), admin.getName());

        log.info("Admin logged in successfully: {}", admin.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .role("ADMIN")
                .name(admin.getName())
                .userId(admin.getId())
                .expiresIn(jwtTokenProvider.getExpirationMs("ROLE_ADMIN"))
                .build();
    }

    /**
     * Authenticate resident with resident code and camp start date.
     * The camp start date prevents accidental logins with wrong IDs.
     */
    public AuthResponse loginResident(ResidentLoginRequest request) {
        // Find resident by code
        Resident resident = residentRepository.findByResidentCode(request.getResidentCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resident", "residentCode", request.getResidentCode()));

        // Find matching active camp
        Camp camp = campRepository.findByResidentIdAndStartDate(
                        resident.getId(), request.getCampStartDate())
                .orElseThrow(() -> new BusinessException(
                        "No camp found with the provided start date for this resident. "
                                + "Please check your Resident ID and Camp Start Date."));

        if (!camp.isActive()) {
            throw new BusinessException(
                    "Your camp session is no longer active. Please contact the admin.");
        }

        String token = jwtTokenProvider.generateResidentToken(
                resident.getId(), camp.getId(),
                resident.getResidentCode(), resident.getName());

        log.info("Resident logged in successfully: {} (Camp: {})",
                resident.getResidentCode(), camp.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .role("RESIDENT")
                .name(resident.getName() != null ? resident.getName() : resident.getResidentCode())
                .userId(resident.getId())
                .campId(camp.getId())
                .residentCode(resident.getResidentCode())
                .campStartDate(camp.getStartDate())
                .campEndDate(camp.getEndDate())
                .expiresIn(jwtTokenProvider.getExpirationMs("ROLE_RESIDENT"))
                .build();
    }

    /**
     * Get current user info from JWT context.
     */
    public AuthResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();

        AuthResponse.AuthResponseBuilder responseBuilder = AuthResponse.builder()
                .role(principal.getUserType())
                .name(principal.getName())
                .userId(principal.getUserId());

        if (principal.isAdmin()) {
            Admin admin = adminRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", principal.getUserId()));
            responseBuilder.name(admin.getName());
        } else if (principal.isResident()) {
            Resident resident = residentRepository.findById(principal.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resident", "id", principal.getUserId()));
            responseBuilder
                    .residentCode(resident.getResidentCode())
                    .name(resident.getName() != null ? resident.getName() : resident.getResidentCode())
                    .campId(principal.getCampId());

            if (principal.getCampId() != null) {
                campRepository.findById(principal.getCampId()).ifPresent(camp -> {
                    responseBuilder.campStartDate(camp.getStartDate());
                    responseBuilder.campEndDate(camp.getEndDate());
                });
            }
        }

        return responseBuilder.build();
    }
}
