package com.ashram.feedback.dish.dto;

import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDishRequest {

    @NotBlank(message = "Dish name is required")
    @Size(max = 255, message = "Dish name must not exceed 255 characters")
    private String name;

    private String displayName;

    @NotNull(message = "Category is required")
    private DishCategory category;

    private String description;

    private Integer preparationTime;

    private Difficulty difficulty;

    private String healthBenefits;

    private String youtubeUrl;

    private List<String> imageUrls;

    @Valid
    private RecipeDto recipe;

    @Valid
    private NutritionDto nutrition;

    @Valid
    private AllergenDto allergen;
}
