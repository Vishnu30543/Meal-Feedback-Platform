package com.ashram.feedback.analytics.controller;

import com.ashram.feedback.analytics.dto.*;
import com.ashram.feedback.analytics.service.AnalyticsService;
import com.ashram.feedback.auth.security.JwtUserPrincipal;
import com.ashram.feedback.common.dto.ApiResponse;
import com.ashram.feedback.rating.repository.DishRatingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting endpoints")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final DishRatingRepository dishRatingRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard stats — 7 key metrics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/feedback-status/today")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Today's Feedback Status table",
            description = "Per-resident submission status for today's menu (Submitted / Partial / Pending)")
    public ResponseEntity<ApiResponse<List<AdminFeedbackStatusDto>>> getTodayFeedbackStatus() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTodayFeedbackStatus()));
    }

    @GetMapping("/daily-trends")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Daily trends for dashboard metrics",
            description = "Get day-wise breakdown of residents present, rated, pending, completion %, avg overall rating, avg dish rating")
    public ResponseEntity<ApiResponse<List<DailyTrendDto>>> getDailyTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyTrends(startDate, endDate)));
    }

    @GetMapping("/resident-stats")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    @Operation(summary = "Resident food statistics")
    public ResponseEntity<ApiResponse<ResidentStatsDto>> getResidentStats(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getResidentStats(principal.getUserId())));
    }

    @GetMapping("/monthly-comparison")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Monthly comparison with trends")
    public ResponseEntity<ApiResponse<MonthlyComparisonDto>> getMonthlyComparison(
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyComparison(year)));
    }

    @GetMapping("/daily-satisfaction")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Daily satisfaction trend")
    public ResponseEntity<ApiResponse<List<Object[]>>> getDailySatisfaction(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getDailySatisfaction(startDate, endDate)));
    }

    @GetMapping("/top-dishes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Top dishes by metric",
            description = "metric: TOP_RATED | MOST_RATED | MOST_SAVED | MOST_FAVOURITED")
    public ResponseEntity<ApiResponse<List<TopDishDto>>> getTopDishes(
            @RequestParam(defaultValue = "TOP_RATED") String metric,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopDishes(metric, limit)));
    }

    @GetMapping("/rating-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Overall rating distribution")
    public ResponseEntity<ApiResponse<List<Object[]>>> getOverallDistribution() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverallRatingDistribution()));
    }

    @GetMapping("/dish/{dishId}/rating-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dish rating distribution")
    public ResponseEntity<ApiResponse<List<Object[]>>> getDishDistribution(@PathVariable Long dishId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDishRatingDistribution(dishId)));
    }

    /**
     * Full Dish Analytics page — overview, monthly trend, distribution, comments, top phrases.
     */
    @GetMapping("/dish/{dishId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Full dish analytics",
            description = "Complete analytics for a single dish: overview, monthly trend, distribution, latest comments, most used phrases")
    public ResponseEntity<ApiResponse<DishAnalyticsDto>> getDishAnalytics(@PathVariable Long dishId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDishAnalytics(dishId)));
    }

    /**
     * Dish Comparison — up to 3 dishes side-by-side.
     */
    @GetMapping("/dish/compare")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Compare multiple dishes",
            description = "Compare 1–3 dishes across: avg rating, number of ratings, times served, Cook Later saves, last served date")
    public ResponseEntity<ApiResponse<List<DishComparisonDto>>> compareDishes(
            @RequestParam List<Long> dishIds) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.compareDishes(dishIds)));
    }

    /**
     * Comment keyword search.
     */
    @GetMapping("/comments/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search comments by keyword")
    public ResponseEntity<ApiResponse<?>> searchComments(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                dishRatingRepository.searchComments(q, PageRequest.of(page, size))));
    }

    /**
     * Recent comments feed.
     */
    @GetMapping("/recent-comments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Recent comments")
    public ResponseEntity<ApiResponse<?>> getRecentComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                dishRatingRepository.findRecentRatings(PageRequest.of(page, size))));
    }
}
