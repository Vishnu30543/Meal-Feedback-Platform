package com.ashram.feedback.rating.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingHistoryDto {

    private Long menuId;
    private LocalDate menuDate;

    /** Overall lunch rating submitted by the resident for this day. */
    private OverallEntry overallRating;

    /** Individual dish ratings for this day's menu. */
    private List<DishEntry> dishRatings;

    /** Whether this day's ratings are still editable (before midnight). */
    private boolean editable;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallEntry {
        private Integer rating;
        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DishEntry {
        private Long dishId;
        private String dishName;
        private String dishCategory;
        private Integer rating;
        private String comment;
    }
}
