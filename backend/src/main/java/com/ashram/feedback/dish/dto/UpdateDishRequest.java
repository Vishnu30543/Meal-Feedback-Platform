package com.ashram.feedback.dish.dto;

import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.DishStatus;
import com.ashram.feedback.dish.entity.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDishRequest {

    @NotBlank(message = "Dish name is required")
    private String name;

    private String displayName;

    @NotNull(message = "Category is required")
    private DishCategory category;

    private String description;

    private Integer preparationTime;

    private Difficulty difficulty;

    private String healthBenefits;

    private String youtubeUrl;

    private DishStatus status;

    @Valid
    private RecipeDto recipe;

    @Valid
    private NutritionDto nutrition;

    @Valid
    private AllergenDto allergen;
}
