package com.ashram.feedback.menu.entity;

import com.ashram.feedback.dish.entity.Dish;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "daily_menu_dishes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMenuDish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private DailyMenu dailyMenu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dish_id", nullable = false)
    private Dish dish;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    @Builder.Default
    private MealType mealType = MealType.LUNCH;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
