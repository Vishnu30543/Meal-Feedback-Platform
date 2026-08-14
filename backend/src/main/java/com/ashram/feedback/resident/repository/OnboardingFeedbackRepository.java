package com.ashram.feedback.resident.repository;

import com.ashram.feedback.resident.entity.OnboardingFeedback;
import com.ashram.feedback.resident.entity.Resident;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface OnboardingFeedbackRepository extends JpaRepository<OnboardingFeedback, Long> {
    Optional<OnboardingFeedback> findByResident(Resident resident);
    boolean existsByResident(Resident resident);

    @EntityGraph(attributePaths = {"resident"})
    List<OnboardingFeedback> findAll();
}
