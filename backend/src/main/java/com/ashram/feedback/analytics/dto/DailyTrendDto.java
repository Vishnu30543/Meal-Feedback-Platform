package com.ashram.feedback.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTrendDto {

    private LocalDate date;
    private long residentsPresent;
    private long residentsRated;
    private long pendingFeedback;
    private Double completionPercentage;
    private Double avgOverallRating;
    private Double avgDishRating;
}
