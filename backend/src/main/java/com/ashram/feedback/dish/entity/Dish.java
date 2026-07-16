package com.ashram.feedback.dish.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dishes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DishCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "preparation_time")
    private Integer preparationTime;  // in minutes

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @Column(name = "health_benefits", columnDefinition = "TEXT")
    private String healthBenefits;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DishStatus status = DishStatus.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    // === Relationships ===

    @OneToMany(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<DishImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    private Recipe recipe;

    @OneToOne(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    private Nutrition nutrition;

    @OneToOne(mappedBy = "dish", cascade = CascadeType.ALL, orphanRemoval = true)
    private Allergen allergen;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Get the primary image URL (first image in gallery).
     */
    public String getPrimaryImageUrl() {
        return images.isEmpty() ? null : images.get(0).getImageUrl();
    }
}
