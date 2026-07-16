package com.ashram.feedback.healthtip.dto;

import lombok.*; import java.time.LocalDate; import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthTipDto {
    private Long id; private String title; private String description;
    private String imageUrl; private LocalDate activeDate;
    private Integer priority; private boolean visible; private LocalDateTime createdAt;
}
