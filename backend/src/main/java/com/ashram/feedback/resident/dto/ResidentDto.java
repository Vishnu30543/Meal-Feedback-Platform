package com.ashram.feedback.resident.dto;

import com.ashram.feedback.resident.entity.Camp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentDto {

    private Long id;
    private String residentCode;
    private String name;
    private String phone;
    private List<CampDto> camps;
    private CampDto activeCamp;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
