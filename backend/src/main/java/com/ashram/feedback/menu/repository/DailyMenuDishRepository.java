package com.ashram.feedback.menu.repository;

import com.ashram.feedback.menu.entity.DailyMenuDish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyMenuDishRepository extends JpaRepository<DailyMenuDish, Long> {

    List<DailyMenuDish> findByDailyMenuIdOrderByDisplayOrderAsc(Long menuId);

    void deleteByDailyMenuId(Long menuId);

    @Query("SELECT COUNT(DISTINCT dmd.dailyMenu.id) FROM DailyMenuDish dmd WHERE dmd.dish.id = :dishId")
    long countMenusContainingDish(@Param("dishId") Long dishId);
}
