package com.ashram.feedback.dish.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergenDto {

    private Long id;
    private boolean milk;
    private boolean gluten;
    private boolean peanut;
    private boolean soy;
    private boolean sesame;
    private boolean treeNuts;
    private boolean mustard;
    private boolean celery;
    private boolean sulphites;
}
