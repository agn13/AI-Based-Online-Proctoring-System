package com.proctoring.controller;

import com.proctoring.dto.ExamRequest;
import com.proctoring.dto.ExamResponse;
import com.proctoring.entity.Attempt;
import com.proctoring.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ExamResponse>> availableExams() {
        return ResponseEntity.ok(examService.findAvailableExams());
    }

    @PostMapping("/{examId}/start")
    public ResponseEntity<Attempt> startAttempt(@PathVariable Long examId, Authentication authentication) {
        Attempt attempt = examService.startAttempt(authentication.getName(), examId);
        return ResponseEntity.ok(attempt);
    }
}
