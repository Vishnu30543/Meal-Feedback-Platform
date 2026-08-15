package com.ashram.feedback.doc.controller;

import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.doc.dto.CreateImportantDocRequest;
import com.ashram.feedback.doc.dto.ImportantDocDto;
import com.ashram.feedback.doc.service.ImportantDocService;
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
@RequestMapping("/api/docs")
@RequiredArgsConstructor
@Tag(name = "Important Docs", description = "Important document management endpoints")
public class ImportantDocController {

    private final ImportantDocService service;

    @GetMapping("/visible")
    @Operation(summary = "Get all visible docs (Resident view)")
    public ResponseEntity<ApiResponse<List<ImportantDocDto>>> getVisible() {
        return ResponseEntity.ok(ApiResponse.success(service.getVisible()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all docs (Admin view, paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<ImportantDocDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getAll(page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get doc by ID")
    public ResponseEntity<ApiResponse<ImportantDocDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new doc")
    public ResponseEntity<ApiResponse<ImportantDocDto>> create(
            @Valid @RequestBody CreateImportantDocRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Created", service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a doc")
    public ResponseEntity<ApiResponse<ImportantDocDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateImportantDocRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a doc")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted"));
    }
}
