package com.proctoring.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ResultResponse {
    private Long attemptId;
    private Integer finalScore;
    private String grade;
    private LocalDateTime updatedAt;
}
