package com.ashram.feedback.resident.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingFeedbackSubmitRequest {
    private boolean journeyDelayFaced;
    private String journeyDelayComment;
    private boolean doctorWaitFaced;
    private String doctorWaitComment;
    private boolean floorInchargeIssue;
    private String floorInchargeComment;
}
