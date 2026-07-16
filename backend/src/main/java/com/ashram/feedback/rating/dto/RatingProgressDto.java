package com.ashram.feedback.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingProgressDto {

    private Long menuId;
    private int totalDishes;
    private int ratedDishes;
    private boolean overallRated;
    private boolean editable;   // false after midnight
}
