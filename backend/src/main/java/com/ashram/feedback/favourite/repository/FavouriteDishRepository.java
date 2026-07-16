package com.ashram.feedback.favourite.repository;

import com.ashram.feedback.favourite.entity.FavouriteDish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavouriteDishRepository extends JpaRepository<FavouriteDish, Long> {

    List<FavouriteDish> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    boolean existsByResidentIdAndDishId(Long residentId, Long dishId);

    long countByResidentId(Long residentId);

    long countByDishId(Long dishId);

    void deleteByResidentIdAndDishId(Long residentId, Long dishId);

    @Query("SELECT fd.dish.id, COUNT(fd) as favCount FROM FavouriteDish fd " +
            "GROUP BY fd.dish.id ORDER BY favCount DESC")
    List<Object[]> findMostFavouritedDishes();
}
