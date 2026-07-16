package com.ashram.feedback.dish.dto;

import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.DishStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishSummaryDto {

    private Long id;
    private String name;
    private String displayName;
    private String slug;
    private DishCategory category;
    private String primaryImageUrl;
    private Double averageRating;
    private Integer preparationTime;
    private DishStatus status;
    private boolean hasRecipe;
    private boolean hasNutrition;
}
