package com.ashram.feedback.dish.mapper;

import com.ashram.feedback.dish.dto.AllergenDto;
import com.ashram.feedback.dish.dto.CreateDishRequest;
import com.ashram.feedback.dish.dto.DishDto;
import com.ashram.feedback.dish.dto.DishImageDto;
import com.ashram.feedback.dish.dto.DishSummaryDto;
import com.ashram.feedback.dish.dto.NutritionDto;
import com.ashram.feedback.dish.dto.RecipeDto;
import com.ashram.feedback.dish.dto.UpdateDishRequest;
import com.ashram.feedback.dish.entity.Allergen;
import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.entity.DishImage;
import com.ashram.feedback.dish.entity.Nutrition;
import com.ashram.feedback.dish.entity.Recipe;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-16T21:02:12+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class DishMapperImpl implements DishMapper {

    @Override
    public DishDto toDto(Dish dish) {
        if ( dish == null ) {
            return null;
        }

        DishDto.DishDtoBuilder dishDto = DishDto.builder();

        dishDto.images( toImageDtos( dish.getImages() ) );
        dishDto.recipe( toRecipeDto( dish.getRecipe() ) );
        dishDto.nutrition( toNutritionDto( dish.getNutrition() ) );
        dishDto.allergen( toAllergenDto( dish.getAllergen() ) );
        dishDto.averageRating( dish.getAverageRating() );
        dishDto.category( dish.getCategory() );
        dishDto.createdAt( dish.getCreatedAt() );
        dishDto.description( dish.getDescription() );
        dishDto.difficulty( dish.getDifficulty() );
        dishDto.displayName( dish.getDisplayName() );
        dishDto.healthBenefits( dish.getHealthBenefits() );
        dishDto.id( dish.getId() );
        dishDto.name( dish.getName() );
        dishDto.preparationTime( dish.getPreparationTime() );
        dishDto.slug( dish.getSlug() );
        dishDto.status( dish.getStatus() );
        dishDto.updatedAt( dish.getUpdatedAt() );
        dishDto.youtubeUrl( dish.getYoutubeUrl() );

        return dishDto.build();
    }

    @Override
    public DishSummaryDto toSummaryDto(Dish dish) {
        if ( dish == null ) {
            return null;
        }

        DishSummaryDto.DishSummaryDtoBuilder dishSummaryDto = DishSummaryDto.builder();

        dishSummaryDto.averageRating( dish.getAverageRating() );
        dishSummaryDto.category( dish.getCategory() );
        dishSummaryDto.displayName( dish.getDisplayName() );
        dishSummaryDto.id( dish.getId() );
        dishSummaryDto.name( dish.getName() );
        dishSummaryDto.preparationTime( dish.getPreparationTime() );
        dishSummaryDto.slug( dish.getSlug() );
        dishSummaryDto.status( dish.getStatus() );

        dishSummaryDto.primaryImageUrl( dish.getPrimaryImageUrl() );
        dishSummaryDto.hasRecipe( dish.getRecipe() != null );
        dishSummaryDto.hasNutrition( dish.getNutrition() != null );

        return dishSummaryDto.build();
    }

    @Override
    public DishImageDto toImageDto(DishImage image) {
        if ( image == null ) {
            return null;
        }

        DishImageDto.DishImageDtoBuilder dishImageDto = DishImageDto.builder();

        dishImageDto.displayOrder( image.getDisplayOrder() );
        dishImageDto.id( image.getId() );
        dishImageDto.imageUrl( image.getImageUrl() );

        return dishImageDto.build();
    }

    @Override
    public List<DishImageDto> toImageDtos(List<DishImage> images) {
        if ( images == null ) {
            return null;
        }

        List<DishImageDto> list = new ArrayList<DishImageDto>( images.size() );
        for ( DishImage dishImage : images ) {
            list.add( toImageDto( dishImage ) );
        }

        return list;
    }

    @Override
    public RecipeDto toRecipeDto(Recipe recipe) {
        if ( recipe == null ) {
            return null;
        }

        RecipeDto.RecipeDtoBuilder recipeDto = RecipeDto.builder();

        recipeDto.healthBenefits( recipe.getHealthBenefits() );
        recipeDto.id( recipe.getId() );
        recipeDto.ingredients( recipe.getIngredients() );
        recipeDto.preparationNotes( recipe.getPreparationNotes() );
        recipeDto.preparationSteps( recipe.getPreparationSteps() );
        recipeDto.youtubeUrl( recipe.getYoutubeUrl() );

        return recipeDto.build();
    }

    @Override
    public NutritionDto toNutritionDto(Nutrition nutrition) {
        if ( nutrition == null ) {
            return null;
        }

        NutritionDto.NutritionDtoBuilder nutritionDto = NutritionDto.builder();

        nutritionDto.carbohydrates( nutrition.getCarbohydrates() );
        nutritionDto.energy( nutrition.getEnergy() );
        nutritionDto.fat( nutrition.getFat() );
        nutritionDto.fiber( nutrition.getFiber() );
        nutritionDto.id( nutrition.getId() );
        nutritionDto.protein( nutrition.getProtein() );

        return nutritionDto.build();
    }

    @Override
    public AllergenDto toAllergenDto(Allergen allergen) {
        if ( allergen == null ) {
            return null;
        }

        AllergenDto.AllergenDtoBuilder allergenDto = AllergenDto.builder();

        allergenDto.celery( allergen.isCelery() );
        allergenDto.gluten( allergen.isGluten() );
        allergenDto.id( allergen.getId() );
        allergenDto.milk( allergen.isMilk() );
        allergenDto.mustard( allergen.isMustard() );
        allergenDto.peanut( allergen.isPeanut() );
        allergenDto.sesame( allergen.isSesame() );
        allergenDto.soy( allergen.isSoy() );
        allergenDto.sulphites( allergen.isSulphites() );
        allergenDto.treeNuts( allergen.isTreeNuts() );

        return allergenDto.build();
    }

    @Override
    public Dish toEntity(CreateDishRequest request) {
        if ( request == null ) {
            return null;
        }

        Dish.DishBuilder dish = Dish.builder();

        dish.category( request.getCategory() );
        dish.description( request.getDescription() );
        dish.difficulty( request.getDifficulty() );
        dish.displayName( request.getDisplayName() );
        dish.healthBenefits( request.getHealthBenefits() );
        dish.name( request.getName() );
        dish.preparationTime( request.getPreparationTime() );
        dish.youtubeUrl( request.getYoutubeUrl() );

        return dish.build();
    }

    @Override
    public Recipe toRecipeEntity(RecipeDto dto) {
        if ( dto == null ) {
            return null;
        }

        Recipe.RecipeBuilder recipe = Recipe.builder();

        recipe.healthBenefits( dto.getHealthBenefits() );
        recipe.ingredients( dto.getIngredients() );
        recipe.preparationNotes( dto.getPreparationNotes() );
        recipe.preparationSteps( dto.getPreparationSteps() );
        recipe.youtubeUrl( dto.getYoutubeUrl() );

        return recipe.build();
    }

    @Override
    public Nutrition toNutritionEntity(NutritionDto dto) {
        if ( dto == null ) {
            return null;
        }

        Nutrition.NutritionBuilder nutrition = Nutrition.builder();

        nutrition.carbohydrates( dto.getCarbohydrates() );
        nutrition.energy( dto.getEnergy() );
        nutrition.fat( dto.getFat() );
        nutrition.fiber( dto.getFiber() );
        nutrition.protein( dto.getProtein() );

        return nutrition.build();
    }

    @Override
    public Allergen toAllergenEntity(AllergenDto dto) {
        if ( dto == null ) {
            return null;
        }

        Allergen.AllergenBuilder allergen = Allergen.builder();

        allergen.celery( dto.isCelery() );
        allergen.gluten( dto.isGluten() );
        allergen.milk( dto.isMilk() );
        allergen.mustard( dto.isMustard() );
        allergen.peanut( dto.isPeanut() );
        allergen.sesame( dto.isSesame() );
        allergen.soy( dto.isSoy() );
        allergen.sulphites( dto.isSulphites() );
        allergen.treeNuts( dto.isTreeNuts() );

        return allergen.build();
    }

    @Override
    public void updateDishFromRequest(UpdateDishRequest request, Dish dish) {
        if ( request == null ) {
            return;
        }

        dish.setCategory( request.getCategory() );
        dish.setDescription( request.getDescription() );
        dish.setDifficulty( request.getDifficulty() );
        dish.setDisplayName( request.getDisplayName() );
        dish.setHealthBenefits( request.getHealthBenefits() );
        dish.setName( request.getName() );
        dish.setPreparationTime( request.getPreparationTime() );
        dish.setStatus( request.getStatus() );
        dish.setYoutubeUrl( request.getYoutubeUrl() );
    }
}
