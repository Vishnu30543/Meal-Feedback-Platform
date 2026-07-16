package com.ashram.feedback.resident.repository;

import com.ashram.feedback.resident.entity.Camp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CampRepository extends JpaRepository<Camp, Long> {

    List<Camp> findByResidentIdOrderByStartDateDesc(Long residentId);

    Optional<Camp> findByResidentIdAndActiveTrue(Long residentId);

    @Query("SELECT c FROM Camp c WHERE c.resident.id = :residentId AND c.startDate = :startDate")
    Optional<Camp> findByResidentIdAndStartDate(
            @Param("residentId") Long residentId,
            @Param("startDate") LocalDate startDate);

    @Query("SELECT COUNT(c) FROM Camp c WHERE c.active = true")
    long countActiveCamps();
}
