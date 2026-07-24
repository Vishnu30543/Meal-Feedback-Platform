package com.ashram.feedback.resident.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "residents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resident_code", nullable = false, unique = true)
    private String residentCode;

    @Column
    private String name;

    @Column
    private String phone;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Camp> camps = new ArrayList<>();

    @Column(name = "doj")
    private LocalDate doj;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "archived", nullable = false)
    @Builder.Default
    private boolean archived = false;

    /**
     * Get the currently active camp, if any.
     */
    public Camp getActiveCamp() {
        LocalDate today = LocalDate.now();
        return camps.stream()
                .filter(Camp::isActive)
                .filter(c -> !c.getStartDate().isAfter(today) && !c.getEndDate().isBefore(today))
                .findFirst()
                .orElse(null);
    }
}
