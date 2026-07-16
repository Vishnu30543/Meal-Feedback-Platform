package com.ashram.feedback.ai.controller;

import com.ashram.feedback.ai.dto.AISettingsDto;
import com.ashram.feedback.ai.service.AISettingsService;
import com.ashram.feedback.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/ai-settings") @RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "AI Settings", description = "AI configuration endpoints")
public class AISettingsController {

    private final AISettingsService service;

    @GetMapping @Operation(summary = "Get AI settings")
    public ResponseEntity<ApiResponse<AISettingsDto>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(service.getSettings()));
    }

    @PutMapping @Operation(summary = "Update AI settings")
    public ResponseEntity<ApiResponse<AISettingsDto>> updateSettings(@RequestBody AISettingsDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", service.updateSettings(dto)));
    }
}
