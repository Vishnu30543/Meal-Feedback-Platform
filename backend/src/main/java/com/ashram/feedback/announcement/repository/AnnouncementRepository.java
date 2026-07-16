package com.ashram.feedback.announcement.repository;

import com.ashram.feedback.announcement.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a WHERE a.visible = true " +
            "AND a.startDate <= :today AND a.endDate >= :today " +
            "ORDER BY a.priority DESC, a.startDate DESC")
    List<Announcement> findActiveAnnouncements(@Param("today") LocalDate today);

    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
