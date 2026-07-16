package com.ashram.feedback.dish.repository;

import com.ashram.feedback.dish.entity.DishImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishImageRepository extends JpaRepository<DishImage, Long> {

    List<DishImage> findByDishIdOrderByDisplayOrderAsc(Long dishId);

    void deleteByDishIdAndId(Long dishId, Long imageId);

    int countByDishId(Long dishId);
}
