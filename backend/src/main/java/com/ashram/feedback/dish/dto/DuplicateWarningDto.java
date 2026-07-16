package com.ashram.feedback.dish.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateWarningDto {

    private boolean hasSimilar;
    private List<DishSummaryDto> similarDishes;
    private String message;
}
