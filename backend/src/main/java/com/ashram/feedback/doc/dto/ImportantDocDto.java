package com.ashram.feedback.doc.dto;

import com.ashram.feedback.doc.entity.ImportantDoc.DocType;
import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ImportantDocDto {
    private Long id;
    private String title;
    private String description;
    private String url;
    private DocType docType;
    private String category;
    private boolean visible;
    private LocalDateTime createdAt;
}
