package com.ashram.feedback.healthtip.controller;

import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.healthtip.dto.*;
import com.ashram.feedback.healthtip.service.HealthTipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/health-tips") @RequiredArgsConstructor
@Tag(name = "Health Tips", description = "Health tip management endpoints")
public class HealthTipController {

    private final HealthTipService service;

    @GetMapping("/today")
    @Operation(summary = "Get today's health tips")
    public ResponseEntity<ApiResponse<List<HealthTipDto>>> getTodays() {
        return ResponseEntity.ok(ApiResponse.success(service.getTodaysTips()));
    }

    @GetMapping @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all health tips")
    public ResponseEntity<ApiResponse<PagedResponse<HealthTipDto>>> getAll(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthTipDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HealthTipDto>> create(@Valid @RequestBody CreateHealthTipRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Created", service.create(req)));
    }

    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HealthTipDto>> update(@PathVariable Long id,
            @Valid @RequestBody CreateHealthTipRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", service.update(id, req)));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id); return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }
}
