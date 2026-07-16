package com.ashram.feedback.rating.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitRatingsRequest {

    @Valid
    @NotEmpty(message = "At least one dish rating is required")
    private List<DishRatingItem> dishRatings;

    @Valid
    private OverallRatingItem overallRating;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DishRatingItem {
        @NotNull(message = "Dish ID is required")
        private Long dishId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        @NotBlank(message = "Comment is required")
        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallRatingItem {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        @NotBlank(message = "Comment is required")
        private String comment;
    }
}
