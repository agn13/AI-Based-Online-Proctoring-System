package com.proctoring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FrameRequest {
    @NotNull
    private Long attemptId;

    @NotBlank
    private String base64Frame; // client sends base64-encoded frame image
}
