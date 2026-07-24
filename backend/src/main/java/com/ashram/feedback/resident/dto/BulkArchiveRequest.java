package com.ashram.feedback.resident.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkArchiveRequest {

    @NotEmpty(message = "List of IDs cannot be empty")
    private List<Long> ids;
}
