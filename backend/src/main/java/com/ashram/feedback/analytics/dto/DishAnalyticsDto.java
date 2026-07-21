package com.ashram.feedback.analytics.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishAnalyticsDto {

    // Overview
    private Long dishId;
    private String dishName;
    private String dishCategory;
    private Double averageRating;
    private Long totalRatings;
    private Long timesServed;
    private Long cookLaterSaves;
    private Integer highestRating;
    private Integer lowestRating;

    /** Monthly trend: month name -> average rating */
    private List<MonthlyTrendEntry> monthlyTrend;

    /** Rating distribution: star value -> count */
    private Map<Integer, Long> ratingDistribution;

    /** Latest comments, most recent first */
    private List<CommentEntry> latestComments;

    /** Top frequently used words/phrases from all comments */
    private List<String> mostUsedComments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendEntry {
        private String month;
        private Double averageRating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentEntry {
        private Integer rating;
        private String comment;
        private String submittedAt;
    }
}
