package com.ashram.feedback.menu.dto;

import com.ashram.feedback.dish.dto.DishSummaryDto;
import com.ashram.feedback.menu.entity.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMenuDto {

    private Long id;
    private LocalDate menuDate;
    private boolean published;
    private String remarks;
    private boolean specialDay;
    private String festivalName;
    private Long createdBy;
    private List<MenuDishDto> dishes;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuDishDto {
        private Long id;
        private DishSummaryDto dish;
        private MealType mealType;
        private Integer displayOrder;
    }
}
