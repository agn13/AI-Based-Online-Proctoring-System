package com.proctoring.repository;

import com.proctoring.entity.Attempt;
import com.proctoring.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByAttempt(Attempt attempt);
}
