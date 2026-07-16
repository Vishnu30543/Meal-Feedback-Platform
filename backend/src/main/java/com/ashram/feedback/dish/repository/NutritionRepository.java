package com.ashram.feedback.dish.repository;

import com.ashram.feedback.dish.entity.Nutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NutritionRepository extends JpaRepository<Nutrition, Long> {

    Optional<Nutrition> findByDishId(Long dishId);

    boolean existsByDishId(Long dishId);
}
