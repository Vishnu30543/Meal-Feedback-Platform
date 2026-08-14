package com.ashram.feedback.admin.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingFeedbackAnalyticsDto {
    private long totalSubmissions;
    private long journeyDelayFacedCount;
    private long doctorWaitFacedCount;
    private long floorInchargeIssueCount;
    private List<FeedbackCommentDto> recentComments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackCommentDto {
        private String residentName;
        private String residentCode;
        private String type; // e.g. "Journey Delay", "Doctor Wait", "Floor Incharge"
        private String comment;
        private String date;
    }
}
