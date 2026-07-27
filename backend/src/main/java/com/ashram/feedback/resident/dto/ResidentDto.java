package com.ashram.feedback.resident.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentDto {

    private Long id;
    private String residentCode;
    private String name;
    private String phone;
    private LocalDate doj;
    private List<CampDto> camps;
    private CampDto activeCamp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
