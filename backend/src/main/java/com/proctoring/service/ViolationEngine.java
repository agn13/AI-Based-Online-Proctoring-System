package com.proctoring.service;

import com.proctoring.entity.Attempt;
import com.proctoring.entity.Violation;
import com.proctoring.repository.AttemptRepository;
import com.proctoring.repository.ResultRepository;
import com.proctoring.repository.ViolationRepository;
import com.proctoring.entity.Result;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ViolationEngine {

    private final ViolationRepository violationRepository;
    private final AttemptRepository attemptRepository;
    private final ResultRepository resultRepository;

    private static final int THRESHOLD = 20;

    public ViolationEngine(ViolationRepository violationRepository, AttemptRepository attemptRepository, ResultRepository resultRepository) {
        this.violationRepository = violationRepository;
        this.attemptRepository = attemptRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional
    public void applyViolations(Attempt attempt, List<String> violationTypes) {
        int increment = 0;
        for (String type : violationTypes) {
            int score = switch (type.toLowerCase()) {
                case "multiple_faces" -> 5;
                case "looking_away" -> 2;
                case "phone_detected" -> 10;
                default -> 1;
            };

            Violation violation = Violation.builder()
                    .attempt(attempt)
                    .type(type)
                    .score(score)
                    .detail("Detected " + type)
                    .occurredAt(LocalDateTime.now())
                    .build();

            violationRepository.save(violation);
            attempt.getViolations().add(violation);
            increment += score;
        }

        attempt.setTotalScore(attempt.getTotalScore() + increment);

        if (attempt.getTotalScore() >= THRESHOLD) {
            attempt.setAutoSubmitted(true);
            attempt.setSubmittedAt(LocalDateTime.now());
            createOrUpdateResult(attempt);
        }

        attemptRepository.save(attempt);
        createOrUpdateResult(attempt);
    }

    @Transactional
    public void createOrUpdateResult(Attempt attempt) {
        Result existing = resultRepository.findAll().stream()
                .filter(r -> r.getAttempt().getId().equals(attempt.getId()))
                .findFirst().orElse(null);

        String grade = estimateGrade(attempt.getTotalScore());

        if (existing == null) {
            Result result = Result.builder()
                    .attempt(attempt)
                    .finalScore(attempt.getTotalScore())
                    .grade(grade)
                    .updatedAt(LocalDateTime.now())
                    .build();
            resultRepository.save(result);
        } else {
            existing.setFinalScore(attempt.getTotalScore());
            existing.setGrade(grade);
            existing.setUpdatedAt(LocalDateTime.now());
            resultRepository.save(existing);
        }
    }

    private String estimateGrade(int score) {
        if (score >= THRESHOLD) {
            return "F";
        }
        if (score >= 15) {
            return "D";
        }
        if (score >= 10) {
            return "C";
        }
        return "A";
    }
}
