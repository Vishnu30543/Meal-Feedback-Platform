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

    Optional<DishRating> findByResidentIdAndDailyMenuIdAndDishId(
            Long residentId, Long menuId, Long dishId);

    long countByResidentIdAndDailyMenuId(Long residentId, Long menuId);

    long countByResidentId(Long residentId);

    @Query("SELECT AVG(dr.rating) FROM DishRating dr WHERE dr.dish.id = :dishId")
    Double getAverageRatingByDishId(@Param("dishId") Long dishId);

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
}
