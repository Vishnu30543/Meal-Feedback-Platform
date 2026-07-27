package com.ashram.feedback.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResidentStatsDto {
    private long mealsRated;
    private long favouriteDishes;
    private long savedRecipes;
    private Double averageOverallRating;
}
