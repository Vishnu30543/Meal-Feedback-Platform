package com.ashram.feedback.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TodayDishFeedbackDto {
    private Long dishId;
    private String dishName;
    private Double averageRating;
    private long ratingCount;
    private List<TrendPoint> trend;
    private List<CommentEntry> comments;

    @Data
    @Builder
    public static class TrendPoint {
        private String date;
        private Double averageRating;
    }

    @Data
    @Builder
    public static class CommentEntry {
        private Integer rating;
        private String comment;
        private Long residentId;
        private String residentName;
        private String residentCode;
    }
}
