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
import com.ashram.feedback.rating.entity.DishRating;
import com.ashram.feedback.rating.entity.OverallLunchRating;
import com.ashram.feedback.rating.repository.DishRatingRepository;
import com.ashram.feedback.rating.repository.OverallLunchRatingRepository;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.repository.CampRepository;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Pattern;
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
    private final ResidentRepository residentRepository;

    /**
     * Admin dashboard stats — 7 key metrics.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();

        boolean published = menuRepository.findPublishedByDate(today).isPresent();
        long activeResidents = campRepository.countActiveCamps();
        long totalDishes = dishRepository.countByStatus(DishStatus.ACTIVE);

        long residentsRated = 0;
        Double overallSatisfaction = null;
        Double averageDishRating = dishRatingRepository.getGlobalAverageDishRating();

        Optional<DailyMenu> todayMenu = menuRepository.findByMenuDate(today);
        if (todayMenu.isPresent()) {
            Long menuId = todayMenu.get().getId();
            residentsRated = overallRatingRepository.countByDailyMenuId(menuId);
            overallSatisfaction = overallRatingRepository.getAverageRatingByMenuId(menuId);
        }

        long pendingFeedback = Math.max(0, activeResidents - residentsRated);
        Double completionPct = activeResidents > 0
                ? Math.round((residentsRated * 100.0 / activeResidents) * 10.0) / 10.0
                : 0.0;

        List<Object[]> topDishes = dishRatingRepository.findTopRatedDishes(PageRequest.of(0, 1));
        List<Object[]> bottomDishes = dishRatingRepository.findLowestRatedDishes(PageRequest.of(0, 1));

        return DashboardStatsDto.builder()
                .todayMenuPublished(published)
                .totalActiveResidents(activeResidents)
                .residentsRatedToday(residentsRated)
                .overallSatisfaction(overallSatisfaction != null ? round(overallSatisfaction) : null)
                .averageDishRating(averageDishRating != null ? round(averageDishRating) : null)
                .pendingFeedback(pendingFeedback)
                .completionPercentage(completionPct)
                .todayTopRated(buildTopDish(topDishes))
                .todayLowestRated(buildTopDish(bottomDishes))
                .totalDishes(totalDishes)
                .totalMenus(menuRepository.count())
                .build();
    }

    /**
     * Today's Feedback Status — per-resident submission status for today's menu.
     */
    @Transactional(readOnly = true)
    public List<AdminFeedbackStatusDto> getTodayFeedbackStatus() {
        LocalDate today = LocalDate.now();
        Optional<DailyMenu> todayMenuOpt = menuRepository.findPublishedByDate(today);
        if (todayMenuOpt.isEmpty()) return Collections.emptyList();

        DailyMenu todayMenu = todayMenuOpt.get();
        int totalDishes = todayMenu.getMenuDishes().size();
        Long menuId = todayMenu.getId();

        // Map residentId -> dishRatingCount
        Map<Long, Long> dishCountByResident = new HashMap<>();
        for (Object[] row : dishRatingRepository.countDishRatingsPerResidentForMenu(menuId)) {
            dishCountByResident.put((Long) row[0], (Long) row[1]);
        }

        // Map residentId -> overallRating
        Map<Long, Integer> overallByResident = new HashMap<>();
        for (OverallLunchRating o : overallRatingRepository.findByDailyMenuId(menuId)) {
            overallByResident.put(o.getResident().getId(), o.getRating());
        }

        // Active residents
        List<Resident> activeResidents = residentRepository.findAll().stream()
                .filter(r -> !r.isArchived())
                .collect(Collectors.toList());

        return activeResidents.stream()
                .map(resident -> {
                    long dishCount = dishCountByResident.getOrDefault(resident.getId(), 0L);
                    Integer overallRating = overallByResident.get(resident.getId());

                    String status;
                    if (dishCount == totalDishes && overallRating != null) {
                        status = "Submitted";
                    } else if (dishCount > 0 || overallRating != null) {
                        status = "Partial";
                    } else {
                        status = "Pending";
                    }

                    return AdminFeedbackStatusDto.builder()
                            .residentCode(resident.getResidentCode())
                            .residentName(resident.getName())
                            .dishRatingsSubmitted((int) dishCount)
                            .totalDishes(totalDishes)
                            .overallRating(overallRating)
                            .status(status)
                            .build();
                })
                .sorted(Comparator.comparing(AdminFeedbackStatusDto::getStatus))
                .collect(Collectors.toList());
    }

    /**
     * Daily trends breakdown for a date range (residents present, rated, pending, completion %, avg overall, avg dish).
     */
    @Transactional(readOnly = true)
    public List<DailyTrendDto> getDailyTrends(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusDays(14);
        if (endDate == null) endDate = LocalDate.now();

        long activeResidents = campRepository.countActiveCamps();
        List<DailyTrendDto> trends = new ArrayList<>();

        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            Optional<DailyMenu> menuOpt = menuRepository.findByMenuDate(d);
            long rated = 0;
            Double avgOverall = null;
            Double avgDish = dishRatingRepository.getAverageRatingByDate(d);

            if (menuOpt.isPresent()) {
                Long menuId = menuOpt.get().getId();
                rated = overallRatingRepository.countByDailyMenuId(menuId);
                avgOverall = overallRatingRepository.getAverageRatingByMenuId(menuId);
            }

            long pending = Math.max(0, activeResidents - rated);
            Double completionPct = activeResidents > 0
                    ? Math.round((rated * 100.0 / activeResidents) * 10.0) / 10.0
                    : 0.0;

            trends.add(DailyTrendDto.builder()
                    .date(d)
                    .residentsPresent(activeResidents)
                    .residentsRated(rated)
                    .pendingFeedback(pending)
                    .completionPercentage(completionPct)
                    .avgOverallRating(avgOverall != null ? round(avgOverall) : null)
                    .avgDishRating(avgDish != null ? round(avgDish) : null)
                    .build());
        }

        return trends;
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
                .averageOverallRating(avgRating != null ? round(avgRating) : null)
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
                change = round(avg - previousAvg);
                trend = change > 0 ? "UP" : change < 0 ? "DOWN" : "STABLE";
            }

            months.add(MonthlyComparisonDto.MonthData.builder()
                    .month(Month.of(m).getDisplayName(TextStyle.FULL, Locale.ENGLISH))
                    .avgRating(avg != null ? round(avg) : null)
                    .change(change)
                    .trend(trend)
                    .build());

            if (avg != null) previousAvg = avg;
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
     * Full Dish Analytics page data.
     */
    @Transactional(readOnly = true)
    public DishAnalyticsDto getDishAnalytics(Long dishId) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new RuntimeException("Dish not found: " + dishId));

        String dishName = dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName();
        String dishCategory = dish.getCategory() != null ? dish.getCategory().name() : null;

        // Overview
        Double avgRating = dishRatingRepository.getAverageRatingByDishId(dishId);
        long totalRatings = dishRatingRepository.countByDishId(dishId);
        long timesServed = menuDishRepository.countMenusContainingDish(dishId);
        long saves = cookLaterRepository.countByDishId(dishId);

        // Distribution
        Map<Integer, Long> distribution = new TreeMap<>();
        for (int s = 1; s <= 5; s++) distribution.put(s, 0L);
        for (Object[] row : dishRatingRepository.getRatingDistributionByDish(dishId)) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        int highest = distribution.entrySet().stream()
                .filter(e -> e.getValue() > 0).mapToInt(Map.Entry::getKey).max().orElse(0);
        int lowest = distribution.entrySet().stream()
                .filter(e -> e.getValue() > 0).mapToInt(Map.Entry::getKey).min().orElse(0);

        // Monthly trend (current year)
        int year = LocalDate.now().getYear();
        List<DishAnalyticsDto.MonthlyTrendEntry> monthlyTrend = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            LocalDate start = LocalDate.of(year, m, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            Double avg = dishRatingRepository.getAverageRatingByDishIdBetween(dishId, start, end);
            monthlyTrend.add(DishAnalyticsDto.MonthlyTrendEntry.builder()
                    .month(Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .averageRating(avg != null ? round(avg) : null)
                    .build());
        }

        // Latest 20 comments
        Page<DishRating> latestPage = dishRatingRepository.findLatestCommentsByDish(dishId, PageRequest.of(0, 20));
        List<DishAnalyticsDto.CommentEntry> latestComments = latestPage.getContent().stream()
                .map(dr -> DishAnalyticsDto.CommentEntry.builder()
                        .rating(dr.getRating())
                        .comment(dr.getComment())
                        .submittedAt(dr.getCreatedAt() != null ? dr.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        // Most frequently used words/phrases (top 10)
        List<String> allComments = dishRatingRepository.findAllCommentsByDish(dishId);
        List<String> topPhrases = extractTopPhrases(allComments, 10);

        return DishAnalyticsDto.builder()
                .dishId(dishId)
                .dishName(dishName)
                .dishCategory(dishCategory)
                .averageRating(avgRating != null ? round(avgRating) : null)
                .totalRatings(totalRatings)
                .timesServed(timesServed)
                .cookLaterSaves(saves)
                .highestRating(highest > 0 ? highest : null)
                .lowestRating(lowest > 0 ? lowest : null)
                .monthlyTrend(monthlyTrend)
                .ratingDistribution(distribution)
                .latestComments(latestComments)
                .mostUsedComments(topPhrases)
                .build();
    }

    /**
     * Multi-dish comparison table.
     */
    @Transactional(readOnly = true)
    public List<DishComparisonDto> compareDishes(List<Long> dishIds) {
        return dishIds.stream().map(dishId -> {
            Dish dish = dishRepository.findById(dishId).orElse(null);
            if (dish == null) return null;

            String dishName = dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName();
            String cat = dish.getCategory() != null ? dish.getCategory().name() : null;
            Double avgRating = dishRatingRepository.getAverageRatingByDishId(dishId);
            long numRatings = dishRatingRepository.countByDishId(dishId);
            long timesServed = menuDishRepository.countMenusContainingDish(dishId);
            long saves = cookLaterRepository.countByDishId(dishId);
            LocalDate lastServed = dishRatingRepository.findLastServedDate(dishId);

            return DishComparisonDto.builder()
                    .dishId(dishId)
                    .dishName(dishName)
                    .dishCategory(cat)
                    .averageRating(avgRating != null ? round(avgRating) : null)
                    .numberOfRatings(numRatings)
                    .timesServed(timesServed)
                    .cookLaterSaves(saves)
                    .lastServedDate(lastServed)
                    .build();
        }).filter(Objects::nonNull).collect(Collectors.toList());
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

    // ===== Helpers =====

    private TopDishDto buildTopDish(List<Object[]> results) {
        if (results.isEmpty()) return null;
        Long dishId = (Long) results.get(0)[0];
        Double value = ((Number) results.get(0)[1]).doubleValue();
        return dishRepository.findById(dishId)
                .map(dish -> TopDishDto.builder()
                        .dishId(dish.getId())
                        .dishName(dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName())
                        .averageRating(round(value))
                        .build())
                .orElse(null);
    }

    private List<TopDishDto> buildTopDishList(List<Object[]> results, String valueType) {
        List<Long> dishIds = results.stream().map(r -> (Long) r[0]).collect(Collectors.toList());
        Map<Long, Dish> dishMap = dishRepository.findAllById(dishIds).stream()
                .collect(Collectors.toMap(Dish::getId, d -> d));

        return results.stream().map(row -> {
            Long dishId = (Long) row[0];
            Number value = (Number) row[1];
            Dish dish = dishMap.get(dishId);
            if (dish == null) return null;

            TopDishDto.TopDishDtoBuilder builder = TopDishDto.builder()
                    .dishId(dish.getId())
                    .dishName(dish.getDisplayName() != null ? dish.getDisplayName() : dish.getName());
            if ("avg".equals(valueType)) {
                builder.averageRating(round(value.doubleValue()));
            } else {
                builder.ratingCount(value.longValue());
            }
            builder.servedCount(menuDishRepository.countMenusContainingDish(dishId));
            builder.savedCount(cookLaterRepository.countByDishId(dishId));
            builder.favouriteCount(favouriteRepository.countByDishId(dishId));
            return builder.build();
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    /**
     * Simple word-frequency analysis on comments — returns top N words/phrases.
     * Filters out common stop words.
     */
    private List<String> extractTopPhrases(List<String> comments, int topN) {
        Set<String> stopWords = Set.of(
                "the", "a", "an", "is", "it", "was", "and", "or", "but", "very",
                "too", "so", "of", "to", "in", "at", "for", "on", "be", "this",
                "that", "with", "are", "not", "has", "had", "have", "i", "my",
                "me", "we", "it's", "its", "also", "today", "could", "would", "bit"
        );
        Pattern nonAlpha = Pattern.compile("[^a-zA-Z ]");

        Map<String, Long> freq = comments.stream()
                .flatMap(c -> Arrays.stream(nonAlpha.matcher(c.toLowerCase()).replaceAll(" ").split("\\s+")))
                .filter(w -> w.length() > 2 && !stopWords.contains(w))
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

        return freq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(topN)
                .map(e -> capitalize(e.getKey()))
                .collect(Collectors.toList());
    }

    private String capitalize(String word) {
        if (word == null || word.isEmpty()) return word;
        return Character.toUpperCase(word.charAt(0)) + word.substring(1);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
