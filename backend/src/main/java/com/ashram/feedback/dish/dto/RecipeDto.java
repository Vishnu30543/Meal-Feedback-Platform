package com.ashram.feedback.dish.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDto {

    private Long id;
    private String ingredients;
    private String preparationSteps;
    private String preparationNotes;
    private String healthBenefits;
    private String youtubeUrl;
}
