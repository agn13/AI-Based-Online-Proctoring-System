package com.proctoring.dto;

import lombok.Data;

import java.util.List;

@Data
public class AiResponse {
    private List<String> violations;
}
