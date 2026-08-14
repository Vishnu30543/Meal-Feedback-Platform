package com.ashram.feedback.resident.service;

import com.ashram.feedback.ai.service.AISettingsService;
import com.ashram.feedback.resident.dto.OnboardingFeedbackCheckResponse;
import com.ashram.feedback.resident.dto.OnboardingFeedbackSubmitRequest;
import com.ashram.feedback.resident.entity.OnboardingFeedback;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.repository.OnboardingFeedbackRepository;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OnboardingFeedbackService {

    private final OnboardingFeedbackRepository repository;
    private final ResidentRepository residentRepository;
    private final AISettingsService aiSettingsService;

    @Transactional(readOnly = true)
    public OnboardingFeedbackCheckResponse checkNeedsFeedback(String residentCode) {
        Resident resident = residentRepository.findByResidentCode(residentCode)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found"));

        if (repository.existsByResident(resident)) {
            return new OnboardingFeedbackCheckResponse(false);
        }

        if (resident.getDoj() == null) {
            return new OnboardingFeedbackCheckResponse(false);
        }

        long daysSinceJoining = ChronoUnit.DAYS.between(resident.getDoj(), LocalDate.now());
        
        Integer configuredDays = aiSettingsService.getSettings().getOnboardingFeedbackDays();
        int maxDays = (configuredDays != null) ? configuredDays : 2;

        boolean needsFeedback = daysSinceJoining >= 0 && daysSinceJoining < maxDays;
        
        return new OnboardingFeedbackCheckResponse(needsFeedback);
    }

    @Transactional
    public void submitFeedback(String residentCode, OnboardingFeedbackSubmitRequest request) {
        Resident resident = residentRepository.findByResidentCode(residentCode)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found"));

        if (repository.existsByResident(resident)) {
            throw new IllegalStateException("Feedback already submitted");
        }

        OnboardingFeedback feedback = OnboardingFeedback.builder()
                .resident(resident)
                .journeyDelayFaced(request.isJourneyDelayFaced())
                .journeyDelayComment(request.getJourneyDelayComment())
                .doctorWaitFaced(request.isDoctorWaitFaced())
                .doctorWaitComment(request.getDoctorWaitComment())
                .floorInchargeIssue(request.isFloorInchargeIssue())
                .floorInchargeComment(request.getFloorInchargeComment())
                .build();

        repository.save(feedback);
    }
}
