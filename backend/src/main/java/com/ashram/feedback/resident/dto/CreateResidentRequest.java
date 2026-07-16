package com.ashram.feedback.resident.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateResidentRequest {

    @NotBlank(message = "Resident code is required")
    @Size(max = 50, message = "Resident code must not exceed 50 characters")
    private String residentCode;

    private String name;

    private String phone;
}
