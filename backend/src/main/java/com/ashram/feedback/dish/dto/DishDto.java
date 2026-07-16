package com.ashram.feedback.dish.dto;

import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.DishStatus;
import com.ashram.feedback.dish.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishDto {

    private Long id;
    private String name;
    private String displayName;
    private String slug;
    private DishCategory category;
    private String description;
    private Integer preparationTime;
    private Difficulty difficulty;
    private String healthBenefits;
    private String youtubeUrl;
    private DishStatus status;
    private List<DishImageDto> images;
    private RecipeDto recipe;
    private NutritionDto nutrition;
    private AllergenDto allergen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
