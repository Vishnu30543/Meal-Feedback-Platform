package com.ashram.feedback.rating.service;

import com.ashram.feedback.common.exception.BusinessException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.repository.DishRepository;
import com.ashram.feedback.menu.entity.DailyMenu;
import com.ashram.feedback.menu.repository.DailyMenuRepository;
import com.ashram.feedback.rating.dto.*;
import com.ashram.feedback.rating.entity.DishRating;
import com.ashram.feedback.rating.entity.OverallLunchRating;
import com.ashram.feedback.rating.repository.DishRatingRepository;
import com.ashram.feedback.rating.repository.OverallLunchRatingRepository;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatingService {

    private final DishRatingRepository dishRatingRepository;
    private final OverallLunchRatingRepository overallRatingRepository;
    private final DailyMenuRepository menuRepository;
    private final DishRepository dishRepository;
    private final ResidentRepository residentRepository;

    /**
     * Submit or update ratings for a menu.
     * Editable only until midnight of the menu date.
     */
    @Transactional
    public void submitRatings(Long residentId, Long menuId, SubmitRatingsRequest request) {
        DailyMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "id", menuId));

        // Check editability
        if (!isEditable(menu.getMenuDate())) {
            throw new BusinessException("Ratings can only be submitted or edited on the same day.");
        }

        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", "id", residentId));

        // Submit dish ratings
        for (SubmitRatingsRequest.DishRatingItem item : request.getDishRatings()) {
            Dish dish = dishRepository.findById(item.getDishId())
                    .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", item.getDishId()));

            DishRating existing = dishRatingRepository
                    .findByResidentIdAndDailyMenuIdAndDishId(residentId, menuId, item.getDishId())
                    .orElse(null);

            if (existing != null) {
                existing.setRating(item.getRating());
                existing.setComment(item.getComment());
                dishRatingRepository.save(existing);
            } else {
                DishRating rating = DishRating.builder()
                        .resident(resident)
                        .dailyMenu(menu)
                        .dish(dish)
                        .rating(item.getRating())
                        .comment(item.getComment())
                        .build();
                dishRatingRepository.save(rating);
            }
        }

        // Submit overall rating
        if (request.getOverallRating() != null) {
            OverallLunchRating existing = overallRatingRepository
                    .findByResidentIdAndDailyMenuId(residentId, menuId)
                    .orElse(null);

            if (existing != null) {
                existing.setRating(request.getOverallRating().getRating());
                existing.setComment(request.getOverallRating().getComment());
                overallRatingRepository.save(existing);
            } else {
                OverallLunchRating overall = OverallLunchRating.builder()
                        .resident(resident)
                        .dailyMenu(menu)
                        .rating(request.getOverallRating().getRating())
                        .comment(request.getOverallRating().getComment())
                        .build();
                overallRatingRepository.save(overall);
            }
        }

        log.info("Resident {} submitted ratings for menu {}", residentId, menuId);
    }

    /**
     * Get resident's ratings for a specific menu.
     */
    @Transactional(readOnly = true)
    public SubmitRatingsRequest getMyRatings(Long residentId, Long menuId) {
        List<DishRating> dishRatings = dishRatingRepository
                .findByResidentIdAndDailyMenuId(residentId, menuId);

        List<SubmitRatingsRequest.DishRatingItem> items = dishRatings.stream()
                .map(dr -> new SubmitRatingsRequest.DishRatingItem(
                        dr.getDish().getId(), dr.getRating(), dr.getComment()))
                .collect(Collectors.toList());

        OverallLunchRating overall = overallRatingRepository
                .findByResidentIdAndDailyMenuId(residentId, menuId)
                .orElse(null);

        SubmitRatingsRequest response = new SubmitRatingsRequest();
        response.setDishRatings(items);

        if (overall != null) {
            response.setOverallRating(new SubmitRatingsRequest.OverallRatingItem(
                    overall.getRating(), overall.getComment()));
        }

        return response;
    }

    /**
     * Get rating progress for a resident on today's menu.
     */
    @Transactional(readOnly = true)
    public RatingProgressDto getRatingProgress(Long residentId) {
        DailyMenu todayMenu = menuRepository.findPublishedByDate(LocalDate.now())
                .orElse(null);

        if (todayMenu == null) {
            return RatingProgressDto.builder()
                    .totalDishes(0)
                    .ratedDishes(0)
                    .overallRated(false)
                    .editable(false)
                    .build();
        }

        int totalDishes = todayMenu.getMenuDishes().size();
        long ratedDishes = dishRatingRepository
                .countByResidentIdAndDailyMenuId(residentId, todayMenu.getId());
        boolean overallRated = overallRatingRepository
                .findByResidentIdAndDailyMenuId(residentId, todayMenu.getId()).isPresent();

        return RatingProgressDto.builder()
                .menuId(todayMenu.getId())
                .totalDishes(totalDishes)
                .ratedDishes((int) ratedDishes)
                .overallRated(overallRated)
                .editable(isEditable(todayMenu.getMenuDate()))
                .build();
    }

    /**
     * Get full rating history for a resident, grouped by menu date.
     * Supports filtering by dish name, min rating, category, and date range.
     */
    @Transactional(readOnly = true)
    public List<RatingHistoryDto> getRatingHistory(
            Long residentId,
            String dishName,
            Integer minRating,
            String category,
            LocalDate startDate,
            LocalDate endDate) {

        // Determine sort order for quality filters
        List<DishRating> allDishRatings = dishRatingRepository.findHistoryByFilters(
                residentId, dishName, minRating, category, startDate, endDate);

        // Fetch overall ratings for the matching date range
        List<OverallLunchRating> overallRatings = overallRatingRepository
                .findByResidentIdWithDateRange(residentId, startDate, endDate);

        // Group overall ratings by menuId
        Map<Long, OverallLunchRating> overallByMenuId = overallRatings.stream()
                .collect(Collectors.toMap(o -> o.getDailyMenu().getId(), o -> o, (a, b) -> a));

        // Group dish ratings by menuId, preserving date ordering
        Map<Long, List<DishRating>> dishRatingsByMenuId = new LinkedHashMap<>();
        for (DishRating dr : allDishRatings) {
            dishRatingsByMenuId
                    .computeIfAbsent(dr.getDailyMenu().getId(), k -> new ArrayList<>())
                    .add(dr);
        }

        // Collect all menuIds we need to include (union of dish and overall)
        Set<Long> allMenuIds = new LinkedHashSet<>(dishRatingsByMenuId.keySet());
        overallByMenuId.keySet().forEach(allMenuIds::add);

        // Build final DTOs, sorted by menu date descending
        List<RatingHistoryDto> result = new ArrayList<>();
        for (Long menuId : allMenuIds) {
            List<DishRating> drs = dishRatingsByMenuId.getOrDefault(menuId, Collections.emptyList());
            OverallLunchRating overall = overallByMenuId.get(menuId);

            // Skip entries that have neither a dish rating (after filter) nor overall
            if (drs.isEmpty() && overall == null) continue;

            LocalDate menuDate = drs.isEmpty()
                    ? overall.getDailyMenu().getMenuDate()
                    : drs.get(0).getDailyMenu().getMenuDate();

            List<RatingHistoryDto.DishEntry> dishEntries = drs.stream()
                    .map(dr -> RatingHistoryDto.DishEntry.builder()
                            .dishId(dr.getDish().getId())
                            .dishName(dr.getDish().getDisplayName() != null
                                    ? dr.getDish().getDisplayName() : dr.getDish().getName())
                            .dishCategory(dr.getDish().getCategory() != null
                                    ? dr.getDish().getCategory().name() : null)
                            .rating(dr.getRating())
                            .comment(dr.getComment())
                            .build())
                    .collect(Collectors.toList());

            RatingHistoryDto.OverallEntry overallEntry = (overall != null)
                    ? RatingHistoryDto.OverallEntry.builder()
                            .rating(overall.getRating())
                            .comment(overall.getComment())
                            .build()
                    : null;

            result.add(RatingHistoryDto.builder()
                    .menuId(menuId)
                    .menuDate(menuDate)
                    .overallRating(overallEntry)
                    .dishRatings(dishEntries)
                    .editable(isEditable(menuDate))
                    .build());
        }

        // Sort by date descending (most recent first)
        result.sort((a, b) -> b.getMenuDate().compareTo(a.getMenuDate()));
        return result;
    }

    /**
     * Ratings are editable only on the same day (until midnight).
     */
    private boolean isEditable(LocalDate menuDate) {
        return !LocalDate.now().isAfter(menuDate);
    }
}
