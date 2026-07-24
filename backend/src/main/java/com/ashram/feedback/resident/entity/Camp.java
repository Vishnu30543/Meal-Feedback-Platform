package com.ashram.feedback.resident.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "camps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Camp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampDuration duration;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Optional custom duration in days. Used only when duration = CUSTOM.
     */
    @Column(name = "custom_days")
    private Integer customDays;

    /**
     * Camp duration options at the ashram.
     */
    public enum CampDuration {
        FIFTEEN(15),
        THIRTY(30),
        SIXTY(60),
        NINETY(90),
        CUSTOM(0),
        PERMANENT(36500); // 100 years

        private final int days;

        CampDuration(int days) {
            this.days = days;
        }

        public int getDays() {
            return days;
        }
    }
}
