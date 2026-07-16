package com.ashram.feedback.auth.controller;

import com.ashram.feedback.auth.dto.AdminLoginRequest;
import com.ashram.feedback.auth.dto.AuthResponse;
import com.ashram.feedback.auth.dto.ResidentLoginRequest;
import com.ashram.feedback.auth.service.AuthService;
import com.ashram.feedback.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Admin and Resident authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/admin/login")
    @Operation(summary = "Admin login", description = "Authenticate admin with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(
            @Valid @RequestBody AdminLoginRequest request) {
        AuthResponse response = authService.loginAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/resident/login")
    @Operation(summary = "Resident login",
            description = "Authenticate resident with resident code and camp start date")
    public ResponseEntity<ApiResponse<AuthResponse>> residentLogin(
            @Valid @RequestBody ResidentLoginRequest request) {
        AuthResponse response = authService.loginResident(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get authenticated user's profile info")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        AuthResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
