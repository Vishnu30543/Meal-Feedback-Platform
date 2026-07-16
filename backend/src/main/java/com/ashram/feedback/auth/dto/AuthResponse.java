package com.ashram.feedback.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String token;
    private String tokenType;
    private String role;
    private String name;
    private Long userId;
    private Long campId;
    private String residentCode;
    private LocalDate campStartDate;
    private LocalDate campEndDate;
    private long expiresIn;
}
