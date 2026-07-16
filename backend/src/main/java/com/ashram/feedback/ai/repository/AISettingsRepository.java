package com.ashram.feedback.ai.repository;

import com.ashram.feedback.ai.entity.AISettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AISettingsRepository extends JpaRepository<AISettings, Long> {
}
