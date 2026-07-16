package com.ashram.feedback.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResidentLoginRequest {

    @NotBlank(message = "Resident code is required")
    private String residentCode;

    @NotNull(message = "Camp start date is required")
    private LocalDate campStartDate;
}
