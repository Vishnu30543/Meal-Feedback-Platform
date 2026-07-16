package com.ashram.feedback.ai.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AISettingsDto {
    private Long id;
    private Integer minimumRatings;
    private boolean aiEnabled;
    private String recommendationType;
}
