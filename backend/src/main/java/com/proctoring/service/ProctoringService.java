package com.proctoring.service;

import com.proctoring.dto.AiResponse;
import com.proctoring.dto.FrameRequest;
import com.proctoring.entity.Attempt;
import com.proctoring.repository.AttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;

@Service
public class ProctoringService {
    private static final Logger logger = LoggerFactory.getLogger(ProctoringService.class);

    private final AttemptRepository attemptRepository;
    private final ViolationEngine violationEngine;
    private final WebClient webClient;

    public ProctoringService(AttemptRepository attemptRepository, ViolationEngine violationEngine, WebClient.Builder builder,
                             @Value("${ai.service.url:http://ai-service:5000}") String aiServiceUrl) {
        this.attemptRepository = attemptRepository;
        this.violationEngine = violationEngine;
        this.webClient = builder.baseUrl(aiServiceUrl).build();
        logger.info("AI Service URL configured: {}", aiServiceUrl);
    }

    @Transactional
    public void processFrame(FrameRequest request) {
        Attempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        AiResponse aiResponse;
        try {
            aiResponse = webClient.post()
                    .uri("/detect")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Collections.singletonMap("frame", request.getBase64Frame()))
                    .retrieve()
                    .bodyToMono(AiResponse.class)
                    .block();
        } catch (Exception e) {
            logger.error("AI service call failed", e);
            return;
        }

        if (aiResponse == null || aiResponse.getViolations() == null || aiResponse.getViolations().isEmpty()) {
            logger.debug("No violation detected for attempt={}", attempt.getId());
            return;
        }

        violationEngine.applyViolations(attempt, aiResponse.getViolations());
        logger.info("Violations applied for attempt={}, violations={}", attempt.getId(), aiResponse.getViolations());
    }
}
