package com.ashram.feedback.resident.dto;

import com.ashram.feedback.resident.entity.Camp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampDto {

    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private Camp.CampDuration duration;
    private boolean active;
    private LocalDateTime createdAt;
}
