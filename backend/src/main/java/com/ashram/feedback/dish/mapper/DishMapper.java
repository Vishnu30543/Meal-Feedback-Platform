package com.ashram.feedback.dish.mapper;

import com.ashram.feedback.dish.dto.*;
import com.ashram.feedback.dish.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DishMapper {

    @Mapping(target = "images", source = "images")
    @Mapping(target = "recipe", source = "recipe")
    @Mapping(target = "nutrition", source = "nutrition")
    @Mapping(target = "allergen", source = "allergen")
    DishDto toDto(Dish dish);

    @Mapping(target = "primaryImageUrl", expression = "java(dish.getPrimaryImageUrl())")
    @Mapping(target = "hasRecipe", expression = "java(dish.getRecipe() != null)")
    @Mapping(target = "hasNutrition", expression = "java(dish.getNutrition() != null)")
    DishSummaryDto toSummaryDto(Dish dish);

    DishImageDto toImageDto(DishImage image);

    List<DishImageDto> toImageDtos(List<DishImage> images);

    RecipeDto toRecipeDto(Recipe recipe);

    NutritionDto toNutritionDto(Nutrition nutrition);

    AllergenDto toAllergenDto(Allergen allergen);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "recipe", ignore = true)
    @Mapping(target = "nutrition", ignore = true)
    @Mapping(target = "allergen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    Dish toEntity(CreateDishRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dish", ignore = true)
    Recipe toRecipeEntity(RecipeDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dish", ignore = true)
    Nutrition toNutritionEntity(NutritionDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dish", ignore = true)
    Allergen toAllergenEntity(AllergenDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "recipe", ignore = true)
    @Mapping(target = "nutrition", ignore = true)
    @Mapping(target = "allergen", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    void updateDishFromRequest(UpdateDishRequest request, @MappingTarget Dish dish);
}
