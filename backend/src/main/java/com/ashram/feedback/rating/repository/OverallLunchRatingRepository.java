package com.ashram.feedback.rating.repository;

import com.ashram.feedback.rating.entity.OverallLunchRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OverallLunchRatingRepository extends JpaRepository<OverallLunchRating, Long> {

    Optional<OverallLunchRating> findByResidentIdAndDailyMenuId(Long residentId, Long menuId);

    long countByDailyMenuId(Long menuId);

    long countByResidentId(Long residentId);

    @Query("SELECT AVG(o.rating) FROM OverallLunchRating o WHERE o.dailyMenu.id = :menuId")
    Double getAverageRatingByMenuId(@Param("menuId") Long menuId);

    @Query("SELECT AVG(o.rating) FROM OverallLunchRating o WHERE o.resident.id = :residentId")
    Double getAverageRatingByResidentId(@Param("residentId") Long residentId);

    @Query("SELECT AVG(o.rating) FROM OverallLunchRating o " +
            "WHERE o.dailyMenu.menuDate BETWEEN :startDate AND :endDate")
    Double getAverageRatingBetween(@Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT o.rating, COUNT(o) FROM OverallLunchRating o " +
            "GROUP BY o.rating ORDER BY o.rating")
    List<Object[]> getOverallRatingDistribution();

    @Query("SELECT o.dailyMenu.menuDate, AVG(o.rating) FROM OverallLunchRating o " +
            "WHERE o.dailyMenu.menuDate BETWEEN :startDate AND :endDate " +
            "GROUP BY o.dailyMenu.menuDate ORDER BY o.dailyMenu.menuDate")
    List<Object[]> getDailySatisfactionTrend(@Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    /** All overall ratings for a resident, ordered most recent first */
    @Query("SELECT o FROM OverallLunchRating o WHERE o.resident.id = :residentId " +
            "AND (:startDate IS NULL OR o.dailyMenu.menuDate >= :startDate) " +
            "AND (:endDate IS NULL OR o.dailyMenu.menuDate <= :endDate) " +
            "ORDER BY o.dailyMenu.menuDate DESC")
    List<OverallLunchRating> findByResidentIdWithDateRange(
            @Param("residentId") Long residentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /** All overall ratings for a menu (for admin feedback status table) */
    @Query("SELECT o FROM OverallLunchRating o WHERE o.dailyMenu.id = :menuId")
    List<OverallLunchRating> findByDailyMenuId(@Param("menuId") Long menuId);
}
