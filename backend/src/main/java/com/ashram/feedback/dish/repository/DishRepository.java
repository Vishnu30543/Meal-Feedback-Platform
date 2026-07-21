package com.ashram.feedback.dish.repository;

import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.entity.DishCategory;
import com.ashram.feedback.dish.entity.DishStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {

    @EntityGraph(attributePaths = {"images", "recipe", "nutrition", "allergen"})
    Optional<Dish> findById(Long id);

    Optional<Dish> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"images", "recipe", "nutrition"})
    @Query("SELECT d FROM Dish d WHERE d.status = :status " +
            "AND (:search IS NULL OR :search = '' OR " +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.displayName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:category IS NULL OR d.category = :category)")
    Page<Dish> searchDishes(@Param("search") String search,
                            @Param("category") DishCategory category,
                            @Param("status") DishStatus status,
                            Pageable pageable);

    @EntityGraph(attributePaths = {"images", "recipe", "nutrition"})
    @Query("SELECT d FROM Dish d WHERE d.status = 'ACTIVE' " +
            "AND (:category IS NULL OR d.category = :category)")
    List<Dish> findAllActiveByCategory(@Param("category") DishCategory category);

    /**
     * Find dishes with similar names for duplicate detection.
     * Uses LIKE with wildcards for fuzzy matching.
     */
    @Query("SELECT d FROM Dish d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "AND d.status = 'ACTIVE'")
    List<Dish> findSimilarDishes(@Param("name") String name);

    List<Dish> findByStatus(DishStatus status);

    long countByStatus(DishStatus status);
}
