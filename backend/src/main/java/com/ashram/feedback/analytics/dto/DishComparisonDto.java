package com.ashram.feedback.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishComparisonDto {

    private Long dishId;
    private String dishName;
    private String dishCategory;
    private Double averageRating;
    private Long numberOfRatings;
    private Long timesServed;
    private Long cookLaterSaves;
    private LocalDate lastServedDate;
}
