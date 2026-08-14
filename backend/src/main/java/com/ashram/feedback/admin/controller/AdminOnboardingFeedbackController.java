package com.ashram.feedback.admin.controller;

import com.ashram.feedback.admin.dto.OnboardingFeedbackAnalyticsDto;
import com.ashram.feedback.resident.entity.OnboardingFeedback;
import com.ashram.feedback.resident.repository.OnboardingFeedbackRepository;
import lombok.RequiredArgsConstructor;
import com.ashram.feedback.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/onboarding-feedback")
@RequiredArgsConstructor
public class AdminOnboardingFeedbackController {

    private final OnboardingFeedbackRepository repository;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<OnboardingFeedbackAnalyticsDto>> getAnalytics() {
        List<OnboardingFeedback> allFeedback = repository.findAll();

        long total = allFeedback.size();
        long journeyDelayCount = allFeedback.stream().filter(OnboardingFeedback::isJourneyDelayFaced).count();
        long doctorWaitCount = allFeedback.stream().filter(OnboardingFeedback::isDoctorWaitFaced).count();
        long floorInchargeCount = allFeedback.stream().filter(OnboardingFeedback::isFloorInchargeIssue).count();

        List<OnboardingFeedbackAnalyticsDto.FeedbackCommentDto> comments = new ArrayList<>();

        for (OnboardingFeedback f : allFeedback) {
            String name = f.getResident().getName();
            String code = f.getResident().getResidentCode();
            String date = f.getCreatedAt().toLocalDate().toString();

            if (f.getJourneyDelayComment() != null && !f.getJourneyDelayComment().isBlank()) {
                comments.add(new OnboardingFeedbackAnalyticsDto.FeedbackCommentDto(name, code, "Journey Delay", f.getJourneyDelayComment(), date));
            }
            if (f.getDoctorWaitComment() != null && !f.getDoctorWaitComment().isBlank()) {
                comments.add(new OnboardingFeedbackAnalyticsDto.FeedbackCommentDto(name, code, "Doctor Wait", f.getDoctorWaitComment(), date));
            }
            if (f.getFloorInchargeComment() != null && !f.getFloorInchargeComment().isBlank()) {
                comments.add(new OnboardingFeedbackAnalyticsDto.FeedbackCommentDto(name, code, "Floor Incharge", f.getFloorInchargeComment(), date));
            }
        }

        // Sort comments by date descending, limit to top 50
        comments.sort((c1, c2) -> c2.getDate().compareTo(c1.getDate()));
        if (comments.size() > 50) {
            comments = comments.subList(0, 50);
        }

        OnboardingFeedbackAnalyticsDto dto = OnboardingFeedbackAnalyticsDto.builder()
                .totalSubmissions(total)
                .journeyDelayFacedCount(journeyDelayCount)
                .doctorWaitFacedCount(doctorWaitCount)
                .floorInchargeIssueCount(floorInchargeCount)
                .recentComments(comments)
                .build();

        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
