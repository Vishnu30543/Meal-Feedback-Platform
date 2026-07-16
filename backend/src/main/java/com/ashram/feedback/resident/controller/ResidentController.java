package com.ashram.feedback.resident.controller;

import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.resident.dto.*;
import com.ashram.feedback.resident.service.ResidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
@RequiredArgsConstructor
@Tag(name = "Residents", description = "Resident and Camp management endpoints")
public class ResidentController {

    private final ResidentService residentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all residents", description = "Paginated list with search by code/name")
    public ResponseEntity<ApiResponse<PagedResponse<ResidentDto>>> getAllResidents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "false") boolean activeCampOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                residentService.getAllResidents(search, activeCampOnly, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get resident by ID", description = "Full resident details with all camps")
    public ResponseEntity<ApiResponse<ResidentDto>> getResidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(residentService.getResidentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create resident")
    public ResponseEntity<ApiResponse<ResidentDto>> createResident(
            @Valid @RequestBody CreateResidentRequest request) {
        ResidentDto resident = residentService.createResident(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resident created successfully", resident));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resident", description = "Update name/phone — code is permanent")
    public ResponseEntity<ApiResponse<ResidentDto>> updateResident(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResidentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resident updated successfully",
                residentService.updateResident(id, request)));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Archive resident", description = "Toggle archive status for soft-delete")
    public ResponseEntity<ApiResponse<ResidentDto>> archiveResident(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Resident archived successfully",
                residentService.archiveResident(id)));
    }

    // === Camp Management ===

    @GetMapping("/{id}/camps")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all camps for a resident")
    public ResponseEntity<ApiResponse<List<CampDto>>> getResidentCamps(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(residentService.getResidentCamps(id)));
    }

    @PostMapping("/{id}/camps")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add new camp to resident")
    public ResponseEntity<ApiResponse<CampDto>> addCamp(
            @PathVariable Long id,
            @Valid @RequestBody CreateCampRequest request) {
        CampDto camp = residentService.addCamp(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Camp added successfully", camp));
    }

    @PatchMapping("/{id}/camps/{campId}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle camp active status")
    public ResponseEntity<ApiResponse<CampDto>> toggleCampActive(
            @PathVariable Long id,
            @PathVariable Long campId) {
        return ResponseEntity.ok(ApiResponse.success("Camp status toggled",
                residentService.toggleCampActive(id, campId)));
    }
}
