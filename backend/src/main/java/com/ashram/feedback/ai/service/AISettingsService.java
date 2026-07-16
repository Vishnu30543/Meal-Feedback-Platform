package com.ashram.feedback.ai.service;

import com.ashram.feedback.ai.dto.AISettingsDto;
import com.ashram.feedback.ai.entity.AISettings;
import com.ashram.feedback.ai.repository.AISettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AISettingsService {

    private final AISettingsRepository repository;

    @Transactional(readOnly = true)
    public AISettingsDto getSettings() {
        AISettings settings = repository.findAll().stream().findFirst()
                .orElseGet(() -> repository.save(AISettings.builder().build()));
        return toDto(settings);
    }

    @Transactional
    public AISettingsDto updateSettings(AISettingsDto dto) {
        AISettings settings = repository.findAll().stream().findFirst()
                .orElseGet(() -> repository.save(AISettings.builder().build()));
        settings.setMinimumRatings(dto.getMinimumRatings());
        settings.setAiEnabled(dto.isAiEnabled());
        settings.setRecommendationType(dto.getRecommendationType());
        return toDto(repository.save(settings));
    }

    private AISettingsDto toDto(AISettings s) {
        return AISettingsDto.builder().id(s.getId()).minimumRatings(s.getMinimumRatings())
                .aiEnabled(s.isAiEnabled()).recommendationType(s.getRecommendationType()).build();
    }
}
