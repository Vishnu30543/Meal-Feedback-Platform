package com.ashram.feedback.dish.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "allergens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allergen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false, unique = true)
    private Dish dish;

    @Builder.Default
    private boolean milk = false;

    @Builder.Default
    private boolean gluten = false;

    @Builder.Default
    private boolean peanut = false;

    @Builder.Default
    private boolean soy = false;

    @Builder.Default
    private boolean sesame = false;

    @Column(name = "tree_nuts")
    @Builder.Default
    private boolean treeNuts = false;

    @Builder.Default
    private boolean mustard = false;

    @Builder.Default
    private boolean celery = false;

    @Builder.Default
    private boolean sulphites = false;

    /**
     * Check if any allergen is present.
     */
    public boolean hasAnyAllergen() {
        return milk || gluten || peanut || soy || sesame
                || treeNuts || mustard || celery || sulphites;
    }
}
