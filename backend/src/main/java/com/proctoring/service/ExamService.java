package com.proctoring.service;

import com.proctoring.dto.ExamRequest;
import com.proctoring.dto.ExamResponse;
import com.proctoring.entity.Attempt;
import com.proctoring.entity.Exam;
import com.proctoring.entity.UserEntity;
import com.proctoring.repository.AttemptRepository;
import com.proctoring.repository.ExamRepository;
import com.proctoring.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;

    public ExamService(ExamRepository examRepository, UserRepository userRepository, AttemptRepository attemptRepository) {
        this.examRepository = examRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ExamResponse createExam(ExamRequest req) {
        if (req.getStartTime().isAfter(req.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Exam exam = Exam.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .build();

        Exam saved = examRepository.save(exam);
        return ExamResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .build();
    }

    public List<ExamResponse> findAvailableExams() {
        LocalDateTime now = LocalDateTime.now();
        return examRepository.findByStartTimeAfter(now).stream()
                .map(exam -> ExamResponse.builder()
                        .id(exam.getId())
                        .title(exam.getTitle())
                        .description(exam.getDescription())
                        .startTime(exam.getStartTime())
                        .endTime(exam.getEndTime())
                        .build())
                .collect(Collectors.toList());
    }

    public Attempt startAttempt(String username, Long examId) {
        UserEntity student = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Exam exam = examRepository.findById(examId).orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        return attemptRepository.findByStudentAndExam(student, exam)
                .orElseGet(() -> {
                    Attempt attempt = Attempt.builder()
                            .student(student)
                            .exam(exam)
                            .startedAt(LocalDateTime.now())
                            .build();
                    return attemptRepository.save(attempt);
                });
    }
}
