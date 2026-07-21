package com.ashram.feedback.analytics.service;

import com.ashram.feedback.analytics.dto.*;
import com.ashram.feedback.cooklater.repository.CookLaterRepository;
import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.entity.DishStatus;
import com.ashram.feedback.dish.repository.DishRepository;
import com.ashram.feedback.favourite.repository.FavouriteDishRepository;
import com.ashram.feedback.menu.entity.DailyMenu;
import com.ashram.feedback.menu.repository.DailyMenuDishRepository;
import com.ashram.feedback.menu.repository.DailyMenuRepository;
import com.ashram.feedback.rating.repository.DishRatingRepository;
import com.ashram.feedback.rating.repository.OverallLunchRatingRepository;
import com.ashram.feedback.resident.repository.CampRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DishRatingRepository dishRatingRepository;
    private final OverallLunchRatingRepository overallRatingRepository;
    private final DishRepository dishRepository;
    private final DailyMenuRepository menuRepository;
    private final DailyMenuDishRepository menuDishRepository;
    private final CookLaterRepository cookLaterRepository;
    private final FavouriteDishRepository favouriteRepository;
    private final CampRepository campRepository;

    /**
     * Admin dashboard stats.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();

        boolean published = menuRepository.findPublishedByDate(today).isPresent();
        long activeResidents = campRepository.countActiveCamps();
        long totalDishes = dishRepository.countByStatus(DishStatus.ACTIVE);

        // Today's ratings
        long residentsRated = 0;
        Double satisfaction = null;

        Optional<DailyMenu> todayMenu = menuRepository.findByMenuDate(today);
        if (todayMenu.isPresent()) {
            Long menuId = todayMenu.get().getId();
            residentsRated = overallRatingRepository.countByDailyMenuId(menuId);
            satisfaction = overallRatingRepository.getAverageRatingByMenuId(menuId);
        }

        // Build top rated
        List<Object[]> topDishes = dishRatingRepository.findTopRatedDishes(PageRequest.of(0, 1));
        List<Object[]> bottomDishes = dishRatingRepository.findLowestRatedDishes(PageRequest.of(0, 1));

        return DashboardStatsDto.builder()
                .todayMenuPublished(published)
                .totalActiveResidents(activeResidents)
                .residentsRatedToday(residentsRated)
                .overallSatisfaction(satisfaction)
                .pendingRatings(activeResidents - residentsRated)
                .todayTopRated(buildTopDish(topDishes))
                .todayLowestRated(buildTopDish(bottomDishes))
                .totalDishes(totalDishes)
                .totalMenus(menuRepository.count())
                .build();
    }

    /**
     * Resident food statistics.
     */
    @Transactional(readOnly = true)
    public ResidentStatsDto getResidentStats(Long residentId) {
        long mealsRated = overallRatingRepository.countByResidentId(residentId);
        long favourites = favouriteRepository.countByResidentId(residentId);
        long saved = cookLaterRepository.countByResidentId(residentId);
        Double avgRating = overallRatingRepository.getAverageRatingByResidentId(residentId);

        return ResidentStatsDto.builder()
                .mealsRated(mealsRated)
                .favouriteDishes(favourites)
                .savedRecipes(saved)
                .averageOverallRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null)
                .build();
    }

    /**
     * Monthly comparison with trend arrows.
     */
    @Transactional(readOnly = true)
    public MonthlyComparisonDto getMonthlyComparison(int year) {
        List<MonthlyComparisonDto.MonthData> months = new ArrayList<>();
        Double previousAvg = null;

        for (int m = 1; m <= 12; m++) {
            LocalDate start = LocalDate.of(year, m, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

            Double avg = overallRatingRepository.getAverageRatingBetween(start, end);

            Double change = null;
            String trend = "STABLE";
            if (avg != null && previousAvg != null) {
                change = Math.round((avg - previousAvg) * 10.0) / 10.0;
                trend = change > 0 ? "UP" : change < 0 ? "DOWN" : "STABLE";
            }

            months.add(MonthlyComparisonDto.MonthData.builder()
                    .month(Month.of(m).getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                    .avgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null)
                    .change(change)
                    .trend(trend)
                    .build());

            if (avg != null) {
                previousAvg = avg;
            }
        }

        return MonthlyComparisonDto.builder().months(months).build();
    }

    /**
     * Daily satisfaction trend for a date range.
     */
    @Transactional(readOnly = true)
    public List<Object[]> getDailySatisfaction(LocalDate startDate, LocalDate endDate) {
        return overallRatingRepository.getDailySatisfactionTrend(startDate, endDate);
    }

    /**
     * Top dishes by different metrics.
     */
    @Transactional(readOnly = true)
    public List<TopDishDto> getTopDishes(String metric, int limit) {
        List<Object[]> results;

        switch (metric.toUpperCase()) {
            case "MOST_RATED":
                results = dishRatingRepository.findMostRatedDishes(PageRequest.of(0, limit));
                return buildTopDishList(results, "count");
            case "MOST_SAVED":
                results = cookLaterRepository.findMostSavedRecipes();
                return buildTopDishList(results.stream().limit(limit).collect(Collectors.toList()), "count");
            case "MOST_FAVOURITED":
                results = favouriteRepository.findMostFavouritedDishes();
                return buildTopDishList(results.stream().limit(limit).collect(Collectors.toList()), "count");
            default: // TOP_RATED
                results = dishRatingRepository.findTopRatedDishes(PageRequest.of(0, limit));
                return buildTopDishList(results, "avg");
        }
    }

    /**
     * Overall rating distribution.
     */
    @Transactional(readOnly = true)
    public List<Object[]> getOverallRatingDistribution() {
        return overallRatingRepository.getOverallRatingDistribution();
    }

    /**
     * Dish rating distribution.
     */
    @Transactional(readOnly = true)
    public List<Object[]> getDishRatingDistribution(Long dishId) {
        return dishRatingRepository.getRatingDistributionByDish(dishId);
    }

    // === Helpers ===

    private TopDishDto buildTopDish(List<Object[]> results) {
        if (results.isEmpty()) return null;
        Long dishId = (Long) results.get(0)[0];
        Double value = ((Number) results.get(0)[1]).doubleValue();

        return dishRepository.findById(dishId)
                .map(dish -> TopDishDto.builder()
                        .dishId(dish.getId())
                        .dishName(dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName())
                        .averageRating(Math.round(value * 10.0) / 10.0)
                        .build())
                .orElse(null);
    }

    private List<TopDishDto> buildTopDishList(List<Object[]> results, String valueType) {
        // Collect all dish IDs first to avoid N+1 queries
        List<Long> dishIds = results.stream()
                .map(row -> (Long) row[0])
                .collect(Collectors.toList());

        Map<Long, Dish> dishMap = dishRepository.findAllById(dishIds).stream()
                .collect(Collectors.toMap(Dish::getId, d -> d));

        return results.stream()
                .map(row -> {
                    Long dishId = (Long) row[0];
                    Number value = (Number) row[1];
                    Dish dish = dishMap.get(dishId);
                    if (dish == null) return null;

                    TopDishDto.TopDishDtoBuilder builder = TopDishDto.builder()
                            .dishId(dish.getId())
                            .dishName(dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName());
                    if ("avg".equals(valueType)) {
                        builder.averageRating(Math.round(value.doubleValue() * 10.0) / 10.0);
                    } else {
                        builder.ratingCount(value.longValue());
                    }
                    builder.servedCount(menuDishRepository.countMenusContainingDish(dishId));
                    builder.savedCount(cookLaterRepository.countByDishId(dishId));
                    builder.favouriteCount(favouriteRepository.countByDishId(dishId));
                    return builder.build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
