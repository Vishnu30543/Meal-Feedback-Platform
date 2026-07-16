package com.ashram.feedback.menu.dto;

import com.ashram.feedback.menu.entity.MealType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuRequest {

    @NotNull(message = "Menu date is required")
    private LocalDate menuDate;

    private String remarks;

    private boolean specialDay;

    private String festivalName;

    @NotEmpty(message = "At least one dish is required")
    private List<MenuDishItem> dishes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuDishItem {
        @NotNull(message = "Dish ID is required")
        private Long dishId;

        private MealType mealType = MealType.LUNCH;

        private Integer displayOrder;
    }
}
