package com.ashram.feedback.healthtip.repository;

import com.ashram.feedback.healthtip.entity.HealthTip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HealthTipRepository extends JpaRepository<HealthTip, Long> {

    @Query("SELECT h FROM HealthTip h WHERE h.visible = true AND h.activeDate = :today " +
            "ORDER BY h.priority DESC")
    List<HealthTip> findTodaysTips(@Param("today") LocalDate today);

    Page<HealthTip> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
