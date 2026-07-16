package com.ashram.feedback.healthtip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*; import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateHealthTipRequest {
    @NotBlank(message = "Title is required") private String title;
    private String description; private String imageUrl;
    private LocalDate activeDate; private Integer priority = 0; private boolean visible = true;
}
