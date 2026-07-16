package com.ashram.feedback.menu.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CopyMenuRequest {

    @NotNull(message = "Source date is required")
    private LocalDate sourceDate;

    @NotNull(message = "Target date is required")
    private LocalDate targetDate;
}
