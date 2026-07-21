package com.ashram.feedback.menu.repository;

import com.ashram.feedback.menu.entity.DailyMenu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyMenuRepository extends JpaRepository<DailyMenu, Long> {

    @EntityGraph(attributePaths = {"menuDishes", "menuDishes.dish"})
    Optional<DailyMenu> findByMenuDate(LocalDate menuDate);

    boolean existsByMenuDate(LocalDate menuDate);

    @EntityGraph(attributePaths = {"menuDishes", "menuDishes.dish"})
    @Query("SELECT m FROM DailyMenu m WHERE m.menuDate = :date AND m.published = true")
    Optional<DailyMenu> findPublishedByDate(@Param("date") LocalDate date);

    @Query("SELECT m FROM DailyMenu m ORDER BY m.menuDate DESC")
    Page<DailyMenu> findAllOrderByDateDesc(Pageable pageable);

    @Query("SELECT m FROM DailyMenu m WHERE m.menuDate < :date ORDER BY m.menuDate DESC LIMIT 1")
    Optional<DailyMenu> findPreviousMenu(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM DailyMenu m WHERE m.published = true " +
            "AND m.menuDate BETWEEN :startDate AND :endDate")
    long countPublishedMenusBetween(@Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);
}
