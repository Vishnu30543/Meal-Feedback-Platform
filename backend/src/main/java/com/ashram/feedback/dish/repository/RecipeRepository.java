package com.ashram.feedback.dish.repository;

import com.ashram.feedback.dish.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Optional<Recipe> findByDishId(Long dishId);

    boolean existsByDishId(Long dishId);
}
