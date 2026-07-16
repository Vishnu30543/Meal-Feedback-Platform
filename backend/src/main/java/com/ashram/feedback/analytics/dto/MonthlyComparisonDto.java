package com.ashram.feedback.analytics.dto;

import lombok.*; import java.time.LocalDate; import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MonthlyComparisonDto {
    private List<MonthData> months;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthData {
        private String month;       // "January", "February"
        private Double avgRating;
        private Double change;      // +0.3, -0.1
        private String trend;       // "UP", "DOWN", "STABLE"
    }
}
