package com.ashram.feedback.dish.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DishImageDto {

    private Long id;
    private String imageUrl;
    private Integer displayOrder;
}
