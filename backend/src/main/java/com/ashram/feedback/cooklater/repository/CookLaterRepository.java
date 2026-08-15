package com.ashram.feedback.cooklater.repository;

import com.ashram.feedback.cooklater.entity.CookLater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CookLaterRepository extends JpaRepository<CookLater, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "dish", "dish.images", "dish.recipe",
            "dish.nutrition" })
    List<CookLater> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    Optional<CookLater> findByResidentIdAndDishId(Long residentId, Long dishId);

    boolean existsByResidentIdAndDishId(Long residentId, Long dishId);

    long countByResidentId(Long residentId);

    long countByDishId(Long dishId);

    void deleteByResidentIdAndDishId(Long residentId, Long dishId);

    @Query("SELECT cl.dish.id, COUNT(cl) as saveCount FROM CookLater cl " +
            "GROUP BY cl.dish.id ORDER BY saveCount DESC")
    List<Object[]> findMostSavedRecipes();

    @Query("SELECT cl.dish.id, COUNT(cl) FROM CookLater cl WHERE cl.dish.id IN :dishIds GROUP BY cl.dish.id")
    List<Object[]> countSavedByDishIds(@org.springframework.data.repository.query.Param("dishIds") List<Long> dishIds);
}
