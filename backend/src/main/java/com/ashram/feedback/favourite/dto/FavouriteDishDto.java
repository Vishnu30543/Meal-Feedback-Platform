package com.ashram.feedback.favourite.dto;

import com.ashram.feedback.dish.dto.DishSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavouriteDishDto {

    private Long id;
    private DishSummaryDto dish;
    private Double averageRating;
    private LocalDateTime createdAt;
}
