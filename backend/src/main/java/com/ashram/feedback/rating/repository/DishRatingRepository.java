package com.ashram.feedback.rating.repository;

import com.ashram.feedback.rating.entity.DishRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DishRatingRepository extends JpaRepository<DishRating, Long> {

    List<DishRating> findByResidentIdAndDailyMenuId(Long residentId, Long menuId);

    List<DishRating> findByDailyMenuId(Long menuId);

    Optional<DishRating> findByResidentIdAndDailyMenuIdAndDishId(
            Long residentId, Long menuId, Long dishId);

    long countByResidentIdAndDailyMenuId(Long residentId, Long menuId);

    long countByResidentId(Long residentId);

    long countByDishId(Long dishId);

    @Query("SELECT AVG(dr.rating) FROM DishRating dr WHERE dr.dish.id = :dishId")
    Double getAverageRatingByDishId(@Param("dishId") Long dishId);

    @Query("SELECT dr.dish.id, AVG(dr.rating) FROM DishRating dr WHERE dr.dish.id IN :dishIds GROUP BY dr.dish.id")
    List<Object[]> findAverageRatingsForDishes(@Param("dishIds") List<Long> dishIds);

    @Query("SELECT AVG(dr.rating) FROM DishRating dr WHERE dr.dish.id = :dishId " +
            "AND dr.dailyMenu.menuDate BETWEEN :startDate AND :endDate")
    Double getAverageRatingByDishIdBetween(@Param("dishId") Long dishId,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT dr.dish.id, AVG(dr.rating) as avgRating FROM DishRating dr " +
            "GROUP BY dr.dish.id ORDER BY avgRating DESC")
    List<Object[]> findTopRatedDishes(Pageable pageable);

    @Query("SELECT dr.dish.id, AVG(dr.rating) as avgRating FROM DishRating dr " +
            "GROUP BY dr.dish.id ORDER BY avgRating ASC")
    List<Object[]> findLowestRatedDishes(Pageable pageable);

    @Query("SELECT dr.dish.id, COUNT(dr) as ratingCount FROM DishRating dr " +
            "GROUP BY dr.dish.id ORDER BY ratingCount DESC")
    List<Object[]> findMostRatedDishes(Pageable pageable);

    @Query("SELECT dr FROM DishRating dr WHERE " +
            "LOWER(dr.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY dr.createdAt DESC")
    Page<DishRating> searchComments(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT dr FROM DishRating dr ORDER BY dr.createdAt DESC")
    Page<DishRating> findRecentRatings(Pageable pageable);

    @Query("SELECT dr.rating, COUNT(dr) FROM DishRating dr " +
            "WHERE dr.dish.id = :dishId GROUP BY dr.rating ORDER BY dr.rating")
    List<Object[]> getRatingDistributionByDish(@Param("dishId") Long dishId);

    /** Latest comments for a specific dish, most recent first */
    @Query("SELECT dr FROM DishRating dr WHERE dr.dish.id = :dishId ORDER BY dr.createdAt DESC")
    Page<DishRating> findLatestCommentsByDish(@Param("dishId") Long dishId, Pageable pageable);

    /** All comments for a dish (for phrase frequency analysis) */
    @Query("SELECT dr.comment FROM DishRating dr WHERE dr.dish.id = :dishId")
    List<String> findAllCommentsByDish(@Param("dishId") Long dishId);

    /** Average overall dish rating across all dishes */
    @Query("SELECT AVG(dr.rating) FROM DishRating dr")
    Double getGlobalAverageDishRating();

    /** Last served date for a dish */
    @Query("SELECT MAX(dmd.dailyMenu.menuDate) FROM DailyMenuDish dmd WHERE dmd.dish.id = :dishId")
    LocalDate findLastServedDate(@Param("dishId") Long dishId);

    /** Rating history for a resident grouped by menu date with filters */
    @Query("SELECT dr FROM DishRating dr " +
            "WHERE dr.resident.id = :residentId " +
            "AND (:dishName IS NULL OR LOWER(dr.dish.name) LIKE LOWER(CONCAT('%', :dishName, '%')) " +
            "     OR LOWER(dr.dish.displayName) LIKE LOWER(CONCAT('%', :dishName, '%'))) " +
            "AND (:minRating IS NULL OR dr.rating >= :minRating) " +
            "AND (:category IS NULL OR dr.dish.category = :category) " +
            "AND (:startDate IS NULL OR dr.dailyMenu.menuDate >= :startDate) " +
            "AND (:endDate IS NULL OR dr.dailyMenu.menuDate <= :endDate) " +
            "ORDER BY dr.dailyMenu.menuDate DESC, dr.dish.name ASC")
    List<DishRating> findHistoryByFilters(
            @Param("residentId") Long residentId,
            @Param("dishName") String dishName,
            @Param("minRating") Integer minRating,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /** Dish ratings submitted for a menu by all residents (for admin feedback status) */
    @Query("SELECT dr.resident.id, COUNT(dr) FROM DishRating dr " +
            "WHERE dr.dailyMenu.id = :menuId GROUP BY dr.resident.id")
    List<Object[]> countDishRatingsPerResidentForMenu(@Param("menuId") Long menuId);
    /** Average dish rating for a specific menu date */
    @Query("SELECT AVG(dr.rating) FROM DishRating dr WHERE dr.dailyMenu.menuDate = :date")
    Double getAverageRatingByDate(@Param("date") LocalDate date);

    /** Historical trend grouped by date for a specific dish */
    @Query("SELECT dr.dailyMenu.menuDate, AVG(dr.rating), COUNT(dr) FROM DishRating dr WHERE dr.dish.id = :dishId GROUP BY dr.dailyMenu.menuDate ORDER BY dr.dailyMenu.menuDate ASC")
    List<Object[]> getHistoricalAverageRatingByDishIdGroupedByDate(@Param("dishId") Long dishId);

    /** Historical comments for a specific dish on a specific date */
    @Query("SELECT dr FROM DishRating dr WHERE dr.dish.id = :dishId AND dr.dailyMenu.menuDate = :date ORDER BY dr.createdAt DESC")
    List<DishRating> findByDishIdAndDailyMenuMenuDate(@Param("dishId") Long dishId, @Param("date") LocalDate date);
}
