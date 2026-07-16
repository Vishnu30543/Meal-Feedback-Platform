package com.ashram.feedback.announcement.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnnouncementDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer priority;
    private boolean visible;
    private LocalDateTime createdAt;
}
