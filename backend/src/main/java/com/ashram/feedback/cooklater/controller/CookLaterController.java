package com.ashram.feedback.cooklater.controller;

import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.cooklater.dto.CookLaterDto;
import com.ashram.feedback.cooklater.service.CookLaterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cook-later")
@RequiredArgsConstructor
@Tag(name = "Cook Later", description = "Recipe bookmarking endpoints")
public class CookLaterController {

    private final CookLaterService cookLaterService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    @Operation(summary = "Get my saved recipes")
    public ResponseEntity<ApiResponse<List<CookLaterDto>>> getMySavedRecipes(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                cookLaterService.getMySavedRecipes(principal.getUserId())));
    }

    @PostMapping("/{dishId}")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    @Operation(summary = "Save recipe for later")
    public ResponseEntity<ApiResponse<CookLaterDto>> saveRecipe(
            @PathVariable Long dishId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        CookLaterDto saved = cookLaterService.saveRecipe(principal.getUserId(), dishId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Recipe saved successfully", saved));
    }

    @DeleteMapping("/{dishId}")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    @Operation(summary = "Remove saved recipe")
    public ResponseEntity<ApiResponse<Void>> removeRecipe(
            @PathVariable Long dishId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        cookLaterService.removeRecipe(principal.getUserId(), dishId);
        return ResponseEntity.ok(ApiResponse.success("Recipe removed successfully"));
    }
}
