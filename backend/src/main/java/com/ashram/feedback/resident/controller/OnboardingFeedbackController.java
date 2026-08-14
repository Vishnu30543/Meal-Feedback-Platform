package com.ashram.feedback.resident.controller;

import com.ashram.feedback.resident.dto.OnboardingFeedbackCheckResponse;
import com.ashram.feedback.resident.dto.OnboardingFeedbackSubmitRequest;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.resident.service.OnboardingFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding-feedback")
@RequiredArgsConstructor
public class OnboardingFeedbackController {

    private final OnboardingFeedbackService service;

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<OnboardingFeedbackCheckResponse>> check(@AuthenticationPrincipal JwtUserPrincipal principal) {
        String residentCode = principal.getSubject();
        return ResponseEntity.ok(ApiResponse.success(service.checkNeedsFeedback(residentCode)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submit(@RequestBody OnboardingFeedbackSubmitRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        String residentCode = principal.getSubject();
        service.submitFeedback(residentCode, request);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", null));
    }
}
