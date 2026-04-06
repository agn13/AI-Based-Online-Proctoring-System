package com.proctoring.repository;

import com.proctoring.entity.Attempt;
import com.proctoring.entity.Exam;
import com.proctoring.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    Optional<Attempt> findByStudentAndExam(UserEntity student, Exam exam);
    List<Attempt> findByStudent(UserEntity student);
    List<Attempt> findByStudentId(Long studentId);
}
