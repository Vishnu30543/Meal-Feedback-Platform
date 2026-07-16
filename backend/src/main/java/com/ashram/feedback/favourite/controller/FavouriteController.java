package com.ashram.feedback.favourite.controller;

import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.favourite.dto.FavouriteDishDto;
import com.ashram.feedback.favourite.service.FavouriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
@Tag(name = "Favourites", description = "Favourite dishes endpoints")
public class FavouriteController {

    private final FavouriteService favouriteService;

    @GetMapping
    @PreAuthorize("hasRole('RESIDENT')")
    @Operation(summary = "Get my favourites",
            description = "Auto-calculated from highest-rated dishes")
    public ResponseEntity<ApiResponse<List<FavouriteDishDto>>> getMyFavourites(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                favouriteService.getFavourites(principal.getUserId())));
    }
}
