package com.ashram.feedback.rating.controller;

import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.rating.dto.RatingProgressDto;
import com.ashram.feedback.rating.dto.SubmitRatingsRequest;
import com.ashram.feedback.rating.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Tag(name = "Ratings", description = "Dish and lunch rating endpoints")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/menu/{menuId}")
    @PreAuthorize("hasRole('RESIDENT')")
    @Operation(summary = "Submit ratings", description = "Submit or update dish and overall ratings for a menu")
    public ResponseEntity<ApiResponse<Void>> submitRatings(
            @PathVariable Long menuId,
            @Valid @RequestBody SubmitRatingsRequest request,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        ratingService.submitRatings(principal.getUserId(), menuId, request);
        return ResponseEntity.ok(ApiResponse.success("Ratings submitted successfully"));
    }

    @GetMapping("/menu/{menuId}")
    @PreAuthorize("hasRole('RESIDENT')")
    @Operation(summary = "Get my ratings", description = "Get my ratings for a specific menu")
    public ResponseEntity<ApiResponse<SubmitRatingsRequest>> getMyRatings(
            @PathVariable Long menuId,
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                ratingService.getMyRatings(principal.getUserId(), menuId)));
    }

    @GetMapping("/progress")
    @PreAuthorize("hasRole('RESIDENT')")
    @Operation(summary = "Get rating progress",
            description = "Get today's rating progress (e.g., 6/8 dishes rated)")
    public ResponseEntity<ApiResponse<RatingProgressDto>> getRatingProgress(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                ratingService.getRatingProgress(principal.getUserId())));
    }
}
