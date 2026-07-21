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
    date = "2026-07-21T15:27:52+0530",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.4 (Oracle Corporation)"
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
        dishDto.id( dish.getId() );
        dishDto.name( dish.getName() );
        dishDto.displayName( dish.getDisplayName() );
        dishDto.slug( dish.getSlug() );
        dishDto.category( dish.getCategory() );
        dishDto.description( dish.getDescription() );
        dishDto.averageRating( dish.getAverageRating() );
        dishDto.preparationTime( dish.getPreparationTime() );
        dishDto.difficulty( dish.getDifficulty() );
        dishDto.healthBenefits( dish.getHealthBenefits() );
        dishDto.youtubeUrl( dish.getYoutubeUrl() );
        dishDto.status( dish.getStatus() );
        dishDto.createdAt( dish.getCreatedAt() );
        dishDto.updatedAt( dish.getUpdatedAt() );

        dishDto.primaryImageUrl( dish.getPrimaryImageUrl() );

        return dishDto.build();
    }

    @Override
    public DishSummaryDto toSummaryDto(Dish dish) {
        if ( dish == null ) {
            return null;
        }

        DishSummaryDto.DishSummaryDtoBuilder dishSummaryDto = DishSummaryDto.builder();

        dishSummaryDto.description( dish.getDescription() );
        dishSummaryDto.difficulty( dish.getDifficulty() );
        dishSummaryDto.healthBenefits( dish.getHealthBenefits() );
        dishSummaryDto.id( dish.getId() );
        dishSummaryDto.name( dish.getName() );
        dishSummaryDto.displayName( dish.getDisplayName() );
        dishSummaryDto.slug( dish.getSlug() );
        dishSummaryDto.category( dish.getCategory() );
        dishSummaryDto.averageRating( dish.getAverageRating() );
        dishSummaryDto.preparationTime( dish.getPreparationTime() );
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

        dishImageDto.id( image.getId() );
        dishImageDto.imageUrl( image.getImageUrl() );
        dishImageDto.displayOrder( image.getDisplayOrder() );

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

        recipeDto.id( recipe.getId() );
        recipeDto.ingredients( recipe.getIngredients() );
        recipeDto.preparationSteps( recipe.getPreparationSteps() );
        recipeDto.preparationNotes( recipe.getPreparationNotes() );
        recipeDto.healthBenefits( recipe.getHealthBenefits() );
        recipeDto.youtubeUrl( recipe.getYoutubeUrl() );

        return recipeDto.build();
    }

    @Override
    public NutritionDto toNutritionDto(Nutrition nutrition) {
        if ( nutrition == null ) {
            return null;
        }

        NutritionDto.NutritionDtoBuilder nutritionDto = NutritionDto.builder();

        nutritionDto.id( nutrition.getId() );
        nutritionDto.energy( nutrition.getEnergy() );
        nutritionDto.carbohydrates( nutrition.getCarbohydrates() );
        nutritionDto.protein( nutrition.getProtein() );
        nutritionDto.fat( nutrition.getFat() );
        nutritionDto.fiber( nutrition.getFiber() );

        return nutritionDto.build();
    }

    @Override
    public AllergenDto toAllergenDto(Allergen allergen) {
        if ( allergen == null ) {
            return null;
        }

        AllergenDto.AllergenDtoBuilder allergenDto = AllergenDto.builder();

        allergenDto.id( allergen.getId() );
        allergenDto.milk( allergen.isMilk() );
        allergenDto.gluten( allergen.isGluten() );
        allergenDto.peanut( allergen.isPeanut() );
        allergenDto.soy( allergen.isSoy() );
        allergenDto.sesame( allergen.isSesame() );
        allergenDto.treeNuts( allergen.isTreeNuts() );
        allergenDto.mustard( allergen.isMustard() );
        allergenDto.celery( allergen.isCelery() );
        allergenDto.sulphites( allergen.isSulphites() );

        return allergenDto.build();
    }

    @Override
    public Dish toEntity(CreateDishRequest request) {
        if ( request == null ) {
            return null;
        }

        Dish.DishBuilder dish = Dish.builder();

        dish.name( request.getName() );
        dish.displayName( request.getDisplayName() );
        dish.category( request.getCategory() );
        dish.description( request.getDescription() );
        dish.preparationTime( request.getPreparationTime() );
        dish.difficulty( request.getDifficulty() );
        dish.healthBenefits( request.getHealthBenefits() );
        dish.youtubeUrl( request.getYoutubeUrl() );

        return dish.build();
    }

    @Override
    public Recipe toRecipeEntity(RecipeDto dto) {
        if ( dto == null ) {
            return null;
        }

        Recipe.RecipeBuilder recipe = Recipe.builder();

        recipe.ingredients( dto.getIngredients() );
        recipe.preparationSteps( dto.getPreparationSteps() );
        recipe.preparationNotes( dto.getPreparationNotes() );
        recipe.healthBenefits( dto.getHealthBenefits() );
        recipe.youtubeUrl( dto.getYoutubeUrl() );

        return recipe.build();
    }

    @Override
    public Nutrition toNutritionEntity(NutritionDto dto) {
        if ( dto == null ) {
            return null;
        }

        Nutrition.NutritionBuilder nutrition = Nutrition.builder();

        nutrition.energy( dto.getEnergy() );
        nutrition.carbohydrates( dto.getCarbohydrates() );
        nutrition.protein( dto.getProtein() );
        nutrition.fat( dto.getFat() );
        nutrition.fiber( dto.getFiber() );

        return nutrition.build();
    }

    @Override
    public Allergen toAllergenEntity(AllergenDto dto) {
        if ( dto == null ) {
            return null;
        }

        Allergen.AllergenBuilder allergen = Allergen.builder();

        allergen.milk( dto.isMilk() );
        allergen.gluten( dto.isGluten() );
        allergen.peanut( dto.isPeanut() );
        allergen.soy( dto.isSoy() );
        allergen.sesame( dto.isSesame() );
        allergen.treeNuts( dto.isTreeNuts() );
        allergen.mustard( dto.isMustard() );
        allergen.celery( dto.isCelery() );
        allergen.sulphites( dto.isSulphites() );

        return allergen.build();
    }

    @Override
    public void updateDishFromRequest(UpdateDishRequest request, Dish dish) {
        if ( request == null ) {
            return;
        }

        dish.setName( request.getName() );
        dish.setDisplayName( request.getDisplayName() );
        dish.setCategory( request.getCategory() );
        dish.setDescription( request.getDescription() );
        dish.setPreparationTime( request.getPreparationTime() );
        dish.setDifficulty( request.getDifficulty() );
        dish.setHealthBenefits( request.getHealthBenefits() );
        dish.setYoutubeUrl( request.getYoutubeUrl() );
    }
}
