package com.ashram.feedback.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "ai_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EntityListeners(AuditingEntityListener.class)
public class AISettings {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "minimum_ratings") @Builder.Default
    private Integer minimumRatings = 5;

    @Column(name = "ai_enabled") @Builder.Default
    private boolean aiEnabled = false;

    @Column(name = "recommendation_type")
    private String recommendationType;  // Future placeholder

    @LastModifiedDate @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
