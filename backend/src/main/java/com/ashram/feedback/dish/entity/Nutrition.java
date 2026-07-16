package com.ashram.feedback.dish.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "nutrition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false, unique = true)
    private Dish dish;

    @Column(precision = 8, scale = 2)
    private BigDecimal energy;          // kcal per 100g

    @Column(precision = 8, scale = 2)
    private BigDecimal carbohydrates;   // grams per 100g

    @Column(precision = 8, scale = 2)
    private BigDecimal protein;         // grams per 100g

    @Column(precision = 8, scale = 2)
    private BigDecimal fat;             // grams per 100g

    @Column(precision = 8, scale = 2)
    private BigDecimal fiber;           // grams per 100g
}
