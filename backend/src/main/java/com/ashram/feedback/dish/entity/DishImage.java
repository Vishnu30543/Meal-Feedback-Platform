package com.ashram.feedback.dish.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dish_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DishImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dish_id", nullable = false)
    private Dish dish;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
