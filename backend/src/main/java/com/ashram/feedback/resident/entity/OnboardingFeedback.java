package com.ashram.feedback.resident.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class OnboardingFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false, unique = true)
    private Resident resident;

    @Column(name = "journey_delay_faced", nullable = false)
    private boolean journeyDelayFaced;

    @Column(name = "journey_delay_comment", columnDefinition = "TEXT")
    private String journeyDelayComment;

    @Column(name = "doctor_wait_faced", nullable = false)
    private boolean doctorWaitFaced;

    @Column(name = "doctor_wait_comment", columnDefinition = "TEXT")
    private String doctorWaitComment;

    @Column(name = "floor_incharge_issue", nullable = false)
    private boolean floorInchargeIssue;

    @Column(name = "floor_incharge_comment", columnDefinition = "TEXT")
    private String floorInchargeComment;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
