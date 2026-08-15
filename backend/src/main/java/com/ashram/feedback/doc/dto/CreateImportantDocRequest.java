package com.ashram.feedback.doc.dto;

import com.ashram.feedback.doc.entity.ImportantDoc.DocType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateImportantDocRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "URL is required")
    private String url;

    @NotNull(message = "Doc type is required")
    @Builder.Default
    private DocType docType = DocType.IMAGE;

    private String category;

    @Builder.Default
    private boolean visible = true;
}
