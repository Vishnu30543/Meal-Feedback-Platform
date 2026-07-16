package com.ashram.feedback.analytics.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TopDishDto {
    private Long dishId;
    private String dishName;
    private Double averageRating;
    private long ratingCount;
    private long savedCount;
    private long favouriteCount;
    private long servedCount;
}
