package com.ashram.feedback.announcement.controller;

import com.ashram.feedback.announcement.dto.AnnouncementDto;
import com.ashram.feedback.announcement.dto.CreateAnnouncementRequest;
import com.ashram.feedback.announcement.service.AnnouncementService;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/announcements") @RequiredArgsConstructor
@Tag(name = "Announcements", description = "Announcement management endpoints")
public class AnnouncementController {

    private final AnnouncementService service;

    @GetMapping("/active")
    @Operation(summary = "Get active announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveAnnouncements()));
    }

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all announcements")
    public ResponseEntity<ApiResponse<PagedResponse<AnnouncementDto>>> getAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get announcement by ID")
    public ResponseEntity<ApiResponse<AnnouncementDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create announcement")
    public ResponseEntity<ApiResponse<AnnouncementDto>> create(@Valid @RequestBody CreateAnnouncementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Created", service.create(req)));
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update announcement")
    public ResponseEntity<ApiResponse<AnnouncementDto>> update(@PathVariable Long id,
            @Valid @RequestBody CreateAnnouncementRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", service.update(id, req)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete announcement")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id); return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }
}
