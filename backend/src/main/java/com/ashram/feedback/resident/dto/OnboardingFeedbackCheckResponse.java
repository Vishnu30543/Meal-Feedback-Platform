package com.ashram.feedback.resident.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingFeedbackCheckResponse {
    private boolean needsFeedback;
}
