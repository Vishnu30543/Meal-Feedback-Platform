package com.ashram.feedback.analytics.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFeedbackStatusDto {

    private String residentCode;
    private String residentName;

    /** Number of dishes rated out of total dishes on the menu */
    private int dishRatingsSubmitted;
    private int totalDishes;

    /** Overall lunch rating, null if not yet submitted */
    private Integer overallRating;

    /** Submitted | Partial | Pending */
    private String status;
}
