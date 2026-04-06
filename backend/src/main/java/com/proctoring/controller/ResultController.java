package com.proctoring.controller;

import com.proctoring.dto.ResultResponse;
import com.proctoring.entity.Attempt;
import com.proctoring.entity.Result;
import com.proctoring.repository.AttemptRepository;
import com.proctoring.repository.ResultRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultRepository resultRepository;
    private final AttemptRepository attemptRepository;

    public ResultController(ResultRepository resultRepository, AttemptRepository attemptRepository) {
        this.resultRepository = resultRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResultResponse>> myResults(Authentication auth) {
        String username = auth.getName();
        // This endpoint assumes logged UserEntity exists and is fetched via username.
        // We will provide all results for the student by using the attempt relation.
        // A better implementation would use a custom query to directly join results and user.

        List<ResultResponse> resultResponses = resultRepository.findAll().stream()
                .filter(r -> r.getAttempt() != null && r.getAttempt().getStudent() != null && username.equals(r.getAttempt().getStudent().getUsername()))
                .map(r -> ResultResponse.builder()
                        .attemptId(r.getAttempt().getId())
                        .finalScore(r.getFinalScore())
                        .grade(r.getGrade())
                        .updatedAt(r.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultResponses);
    }
}
