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
import java.util.List;
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
     * Ratings are editable only on the same day (until midnight).
     */
    private boolean isEditable(LocalDate menuDate) {
        return !LocalDate.now().isAfter(menuDate);
    }
}
