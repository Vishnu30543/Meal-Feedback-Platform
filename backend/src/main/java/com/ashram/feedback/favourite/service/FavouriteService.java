package com.ashram.feedback.favourite.service;

import com.ashram.feedback.dish.mapper.DishMapper;
import com.ashram.feedback.favourite.dto.FavouriteDishDto;
import com.ashram.feedback.favourite.entity.FavouriteDish;
import com.ashram.feedback.favourite.repository.FavouriteDishRepository;
import com.ashram.feedback.rating.repository.DishRatingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final FavouriteDishRepository favouriteRepository;
    private final DishRatingRepository dishRatingRepository;
    private final DishMapper dishMapper;

    /**
     * Get favourite dishes for a resident.
     * Auto-calculated from dishes rated 4+ stars.
     */
    @Transactional(readOnly = true)
    public List<FavouriteDishDto> getFavourites(Long residentId) {
        return favouriteRepository.findByResidentIdOrderByCreatedAtDesc(residentId)
                .stream()
                .map(fav -> FavouriteDishDto.builder()
                        .id(fav.getId())
                        .dish(dishMapper.toSummaryDto(fav.getDish()))
                        .averageRating(dishRatingRepository
                                .getAverageRatingByDishId(fav.getDish().getId()))
                        .createdAt(fav.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get count of favourite dishes for a resident.
     */
    @Transactional(readOnly = true)
    public long getFavouriteCount(Long residentId) {
        return favouriteRepository.countByResidentId(residentId);
    }
}
