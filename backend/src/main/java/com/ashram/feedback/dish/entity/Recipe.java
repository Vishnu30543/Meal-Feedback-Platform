package com.ashram.feedback.dish.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false, unique = true)
    private Dish dish;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "preparation_steps", columnDefinition = "TEXT")
    private String preparationSteps;

    @Column(name = "preparation_notes", columnDefinition = "TEXT")
    private String preparationNotes;

    @Column(name = "health_benefits", columnDefinition = "TEXT")
    private String healthBenefits;

    @Column(name = "youtube_url")
    private String youtubeUrl;
}
