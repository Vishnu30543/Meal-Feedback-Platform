package com.ashram.feedback.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateAnnouncementRequest {
    @NotBlank(message = "Title is required") private String title;
    private String description;
    private String imageUrl;
    @NotNull(message = "Start date is required") private LocalDate startDate;
    @NotNull(message = "End date is required") private LocalDate endDate;
    private Integer priority = 0;
    private boolean visible = true;
}
