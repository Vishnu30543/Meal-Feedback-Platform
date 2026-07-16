package com.ashram.feedback.dish.repository;

import com.ashram.feedback.dish.entity.Allergen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AllergenRepository extends JpaRepository<Allergen, Long> {

    Optional<Allergen> findByDishId(Long dishId);

    boolean existsByDishId(Long dishId);
}
