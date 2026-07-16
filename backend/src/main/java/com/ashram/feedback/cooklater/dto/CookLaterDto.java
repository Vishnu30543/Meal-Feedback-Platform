package com.ashram.feedback.cooklater.dto;

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
public class CookLaterDto {

    private Long id;
    private DishSummaryDto dish;
    private boolean hasRecipe;
    private LocalDateTime createdAt;
}
