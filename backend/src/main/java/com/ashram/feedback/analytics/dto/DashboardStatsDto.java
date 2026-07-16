package com.ashram.feedback.analytics.dto;

import lombok.*; import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDto {
    private boolean todayMenuPublished;
    private long totalActiveResidents;
    private long residentsRatedToday;
    private long totalResidents;
    private Double overallSatisfaction;
    private long pendingRatings;
    private TopDishDto todayTopRated;
    private TopDishDto todayLowestRated;
    private long totalDishes;
    private long totalMenus;
}
