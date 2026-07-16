package com.ashram.feedback.dish.controller;

import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.dish.dto.*;
import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.DishStatus;
import com.ashram.feedback.dish.service.DishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
@Tag(name = "Dishes", description = "Dish management endpoints")
public class DishController {

    private final DishService dishService;

    @GetMapping
    @Operation(summary = "Get all dishes", description = "Paginated list with search and category filter")
    public ResponseEntity<ApiResponse<PagedResponse<DishSummaryDto>>> getAllDishes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) DishCategory category,
            @RequestParam(required = false) DishStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                dishService.getAllDishes(search, category, status, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dish by ID", description = "Full dish details with recipe, nutrition, allergens")
    public ResponseEntity<ApiResponse<DishDto>> getDishById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dishService.getDishById(id)));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get dish by slug")
    public ResponseEntity<ApiResponse<DishDto>> getDishBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(dishService.getDishBySlug(slug)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active dishes", description = "Optionally filter by category")
    public ResponseEntity<ApiResponse<List<DishSummaryDto>>> getActiveDishes(
            @RequestParam(required = false) DishCategory category) {
        return ResponseEntity.ok(ApiResponse.success(dishService.getActiveDishes(category)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create dish", description = "Create a new dish with optional recipe, nutrition, allergens")
    public ResponseEntity<ApiResponse<DishDto>> createDish(
            @Valid @RequestBody CreateDishRequest request) {
        DishDto dish = dishService.createDish(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dish created successfully", dish));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update dish")
    public ResponseEntity<ApiResponse<DishDto>> updateDish(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDishRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Dish updated successfully",
                dishService.updateDish(id, request)));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Archive dish", description = "Soft delete — dish is never actually deleted")
    public ResponseEntity<ApiResponse<Void>> archiveDish(@PathVariable Long id) {
        dishService.archiveDish(id);
        return ResponseEntity.ok(ApiResponse.success("Dish archived successfully"));
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Restore archived dish")
    public ResponseEntity<ApiResponse<Void>> restoreDish(@PathVariable Long id) {
        dishService.restoreDish(id);
        return ResponseEntity.ok(ApiResponse.success("Dish restored successfully"));
    }

    @GetMapping("/check-duplicate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Check for duplicate dishes", description = "Returns similar dish names")
    public ResponseEntity<ApiResponse<DuplicateWarningDto>> checkDuplicate(
            @RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(dishService.checkDuplicate(name)));
    }

    // === Image Gallery ===

    @GetMapping("/{id}/images")
    @Operation(summary = "Get dish images")
    public ResponseEntity<ApiResponse<List<DishImageDto>>> getDishImages(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dishService.getDishImages(id)));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add image to dish gallery")
    public ResponseEntity<ApiResponse<DishImageDto>> addImage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        DishImageDto image = dishService.addImage(id, body.get("imageUrl"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image added successfully", image));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove image from dish gallery")
    public ResponseEntity<ApiResponse<Void>> removeImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        dishService.removeImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image removed successfully"));
    }
}
