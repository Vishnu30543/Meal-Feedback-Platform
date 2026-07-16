package com.ashram.feedback.resident.dto;

import com.ashram.feedback.resident.entity.Camp;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCampRequest {

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Duration is required")
    private Camp.CampDuration duration;
}
