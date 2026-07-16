package com.ashram.feedback.analytics.dto;

import lombok.*; import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResidentStatsDto {
    private long mealsRated;
    private long favouriteDishes;
    private long savedRecipes;
    private Double averageOverallRating;
}
