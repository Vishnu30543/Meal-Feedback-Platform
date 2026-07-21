package com.ashram.feedback.dish.service;

import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.DuplicateResourceException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.common.util.SlugUtil;
import com.ashram.feedback.dish.dto.*;
import com.ashram.feedback.dish.entity.*;
import com.ashram.feedback.dish.mapper.DishMapper;
import com.ashram.feedback.dish.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DishService {

    private final DishRepository dishRepository;
    private final DishImageRepository dishImageRepository;
    private final RecipeRepository recipeRepository;
    private final NutritionRepository nutritionRepository;
    private final AllergenRepository allergenRepository;
    private final DishMapper dishMapper;

    /**
     * Get all dishes with search, category filter, and pagination.
     */
    @Transactional(readOnly = true)
    public PagedResponse<DishSummaryDto> getAllDishes(String search, DishCategory category,
                                                      DishStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        DishStatus filterStatus = status != null ? status : DishStatus.ACTIVE;
        Page<Dish> dishPage = dishRepository.searchDishes(search, category, filterStatus, pageable);

        List<DishSummaryDto> content = dishPage.getContent().stream()
                .map(dishMapper::toSummaryDto)
                .collect(Collectors.toList());

        return PagedResponse.of(content, page, size,
                dishPage.getTotalElements(), dishPage.getTotalPages());
    }

    /**
     * Get full dish details by ID.
     */
    @Cacheable(value = "dishById", key = "#id")
    @Transactional(readOnly = true)
    public DishDto getDishById(Long id) {
        Dish dish = findDishOrThrow(id);
        return dishMapper.toDto(dish);
    }

    /**
     * Get dish by slug.
     */
    @Transactional(readOnly = true)
    public DishDto getDishBySlug(String slug) {
        Dish dish = dishRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "slug", slug));
        return dishMapper.toDto(dish);
    }

    /**
     * Create a new dish with all nested data.
     */
    @CacheEvict(value = {"activeDishes", "dishById"}, allEntries = true)
    @Transactional
    public DishDto createDish(CreateDishRequest request) {
        // Generate slug
        String slug = SlugUtil.toSlug(request.getName());
        if (dishRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Dish", "name", request.getName());
        }

        Dish dish = dishMapper.toEntity(request);
        dish.setSlug(slug);
        dish.setStatus(DishStatus.ACTIVE);
        dish.setDisplayName(request.getDisplayName() != null
                ? request.getDisplayName() : request.getName());

        // Set created by
        setAuditFields(dish, true);

        dish = dishRepository.save(dish);

        // Save images
        if (request.getImageUrls() != null) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                DishImage image = DishImage.builder()
                        .dish(dish)
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build();
                dish.getImages().add(image);
            }
        }

        // Save recipe
        if (request.getRecipe() != null) {
            Recipe recipe = dishMapper.toRecipeEntity(request.getRecipe());
            recipe.setDish(dish);
            dish.setRecipe(recipe);
        }

        // Save nutrition
        if (request.getNutrition() != null) {
            Nutrition nutrition = dishMapper.toNutritionEntity(request.getNutrition());
            nutrition.setDish(dish);
            dish.setNutrition(nutrition);
        }

        // Save allergen
        if (request.getAllergen() != null) {
            Allergen allergen = dishMapper.toAllergenEntity(request.getAllergen());
            allergen.setDish(dish);
            dish.setAllergen(allergen);
        }

        dish = dishRepository.save(dish);
        log.info("Created dish: {} (slug: {})", dish.getName(), dish.getSlug());

        return dishMapper.toDto(dish);
    }

    /**
     * Update an existing dish.
     */
    @CacheEvict(value = {"activeDishes", "dishById"}, allEntries = true)
    @Transactional
    public DishDto updateDish(Long id, UpdateDishRequest request) {
        Dish dish = findDishOrThrow(id);

        // Update slug if name changed
        if (!dish.getName().equals(request.getName())) {
            String newSlug = SlugUtil.toSlug(request.getName());
            if (dishRepository.existsBySlug(newSlug) && !newSlug.equals(dish.getSlug())) {
                throw new DuplicateResourceException("Dish", "name", request.getName());
            }
            dish.setSlug(newSlug);
        }

        dishMapper.updateDishFromRequest(request, dish);
        if (request.getDisplayName() == null) {
            dish.setDisplayName(request.getName());
        }
        setAuditFields(dish, false);

        // Update images
        if (request.getImageUrls() != null) {
            dish.getImages().clear();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                DishImage image = DishImage.builder()
                        .dish(dish)
                        .imageUrl(request.getImageUrls().get(i))
                        .displayOrder(i)
                        .build();
                dish.getImages().add(image);
            }
        }

        // Update recipe
        if (request.getRecipe() != null) {
            if (dish.getRecipe() != null) {
                Recipe recipe = dish.getRecipe();
                recipe.setIngredients(request.getRecipe().getIngredients());
                recipe.setPreparationSteps(request.getRecipe().getPreparationSteps());
                recipe.setPreparationNotes(request.getRecipe().getPreparationNotes());
                recipe.setHealthBenefits(request.getRecipe().getHealthBenefits());
                recipe.setYoutubeUrl(request.getRecipe().getYoutubeUrl());
            } else {
                Recipe recipe = dishMapper.toRecipeEntity(request.getRecipe());
                recipe.setDish(dish);
                dish.setRecipe(recipe);
            }
        }

        // Update nutrition
        if (request.getNutrition() != null) {
            if (dish.getNutrition() != null) {
                Nutrition nutrition = dish.getNutrition();
                nutrition.setEnergy(request.getNutrition().getEnergy());
                nutrition.setCarbohydrates(request.getNutrition().getCarbohydrates());
                nutrition.setProtein(request.getNutrition().getProtein());
                nutrition.setFat(request.getNutrition().getFat());
                nutrition.setFiber(request.getNutrition().getFiber());
            } else {
                Nutrition nutrition = dishMapper.toNutritionEntity(request.getNutrition());
                nutrition.setDish(dish);
                dish.setNutrition(nutrition);
            }
        }

        // Update allergen
        if (request.getAllergen() != null) {
            if (dish.getAllergen() != null) {
                Allergen allergen = dish.getAllergen();
                allergen.setMilk(request.getAllergen().isMilk());
                allergen.setGluten(request.getAllergen().isGluten());
                allergen.setPeanut(request.getAllergen().isPeanut());
                allergen.setSoy(request.getAllergen().isSoy());
                allergen.setSesame(request.getAllergen().isSesame());
                allergen.setTreeNuts(request.getAllergen().isTreeNuts());
                allergen.setMustard(request.getAllergen().isMustard());
                allergen.setCelery(request.getAllergen().isCelery());
                allergen.setSulphites(request.getAllergen().isSulphites());
            } else {
                Allergen allergen = dishMapper.toAllergenEntity(request.getAllergen());
                allergen.setDish(dish);
                dish.setAllergen(allergen);
            }
        }

        dish = dishRepository.save(dish);
        log.info("Updated dish: {}", dish.getName());

        return dishMapper.toDto(dish);
    }

    /**
     * Archive a dish (soft delete).
     */
    @CacheEvict(value = {"activeDishes", "dishById"}, allEntries = true)
    @Transactional
    public void archiveDish(Long id) {
        Dish dish = findDishOrThrow(id);
        dish.setStatus(DishStatus.ARCHIVED);
        setAuditFields(dish, false);
        dishRepository.save(dish);
        log.info("Archived dish: {}", dish.getName());
    }

    /**
     * Restore an archived dish.
     */
    @CacheEvict(value = {"activeDishes", "dishById"}, allEntries = true)
    @Transactional
    public void restoreDish(Long id) {
        Dish dish = findDishOrThrow(id);
        dish.setStatus(DishStatus.ACTIVE);
        setAuditFields(dish, false);
        dishRepository.save(dish);
        log.info("Restored dish: {}", dish.getName());
    }

    /**
     * Check for duplicate/similar dishes.
     */
    @Transactional(readOnly = true)
    public DuplicateWarningDto checkDuplicate(String name) {
        List<Dish> similar = dishRepository.findSimilarDishes(name);
        List<DishSummaryDto> similarDtos = similar.stream()
                .map(dishMapper::toSummaryDto)
                .collect(Collectors.toList());

        return DuplicateWarningDto.builder()
                .hasSimilar(!similar.isEmpty())
                .similarDishes(similarDtos)
                .message(similar.isEmpty() ? "No similar dishes found."
                        : "Found " + similar.size() + " similar dish(es). Please review before creating.")
                .build();
    }

    /**
     * Add image to dish gallery.
     */
    @Transactional
    public DishImageDto addImage(Long dishId, String imageUrl) {
        Dish dish = findDishOrThrow(dishId);
        int nextOrder = dishImageRepository.countByDishId(dishId);

        DishImage image = DishImage.builder()
                .dish(dish)
                .imageUrl(imageUrl)
                .displayOrder(nextOrder)
                .build();

        image = dishImageRepository.save(image);
        return dishMapper.toImageDto(image);
    }

    /**
     * Remove image from dish gallery.
     */
    @Transactional
    public void removeImage(Long dishId, Long imageId) {
        findDishOrThrow(dishId);
        dishImageRepository.deleteById(imageId);
    }

    /**
     * Get dish images.
     */
    @Transactional(readOnly = true)
    public List<DishImageDto> getDishImages(Long dishId) {
        findDishOrThrow(dishId);
        return dishImageRepository.findByDishIdOrderByDisplayOrderAsc(dishId)
                .stream()
                .map(dishMapper::toImageDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all active dishes by category.
     */
    @Cacheable(value = "activeDishes", key = "#category != null ? #category.name() : 'ALL'")
    @Transactional(readOnly = true)
    public List<DishSummaryDto> getActiveDishes(DishCategory category) {
        return dishRepository.findAllActiveByCategory(category)
                .stream()
                .map(dishMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    private Dish findDishOrThrow(Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));
    }

    private void setAuditFields(Dish dish, boolean isCreate) {
        try {
            JwtUserPrincipal principal = (JwtUserPrincipal) SecurityContextHolder
                    .getContext().getAuthentication().getPrincipal();
            if (isCreate) {
                dish.setCreatedBy(principal.getUserId());
            }
            dish.setUpdatedBy(principal.getUserId());
        } catch (Exception e) {
            // Ignore if no auth context (e.g., during seeding)
        }
    }
}
