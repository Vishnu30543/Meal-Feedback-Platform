package com.ashram.feedback.menu.entity;

import com.ashram.feedback.auth.entity.Admin;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "daily_menus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DailyMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_date", nullable = false, unique = true)
    private LocalDate menuDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = false;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "special_day")
    @Builder.Default
    private boolean specialDay = false;

    @Column(name = "festival_name")
    private String festivalName;

    @Column(name = "created_by")
    private Long createdBy;

    @OneToMany(mappedBy = "dailyMenu", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<DailyMenuDish> menuDishes = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
