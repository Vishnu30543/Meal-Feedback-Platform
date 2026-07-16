package com.ashram.feedback.cooklater.service;

import com.ashram.feedback.common.exception.BusinessException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.cooklater.dto.CookLaterDto;
import com.ashram.feedback.cooklater.entity.CookLater;
import com.ashram.feedback.cooklater.repository.CookLaterRepository;
import com.ashram.feedback.dish.entity.Dish;
import com.ashram.feedback.dish.mapper.DishMapper;
import com.ashram.feedback.dish.repository.DishRepository;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CookLaterService {

    private final CookLaterRepository cookLaterRepository;
    private final DishRepository dishRepository;
    private final ResidentRepository residentRepository;
    private final DishMapper dishMapper;

    @Transactional(readOnly = true)
    public List<CookLaterDto> getMySavedRecipes(Long residentId) {
        return cookLaterRepository.findByResidentIdOrderByCreatedAtDesc(residentId)
                .stream()
                .map(cl -> CookLaterDto.builder()
                        .id(cl.getId())
                        .dish(dishMapper.toSummaryDto(cl.getDish()))
                        .hasRecipe(cl.getDish().getRecipe() != null)
                        .createdAt(cl.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CookLaterDto saveRecipe(Long residentId, Long dishId) {
        if (cookLaterRepository.existsByResidentIdAndDishId(residentId, dishId)) {
            throw new BusinessException("Recipe already saved.");
        }

        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", "id", residentId));
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", dishId));

        CookLater cookLater = CookLater.builder()
                .resident(resident)
                .dish(dish)
                .build();

        cookLater = cookLaterRepository.save(cookLater);
        log.info("Resident {} saved recipe for dish {}", residentId, dishId);

        return CookLaterDto.builder()
                .id(cookLater.getId())
                .dish(dishMapper.toSummaryDto(dish))
                .hasRecipe(dish.getRecipe() != null)
                .createdAt(cookLater.getCreatedAt())
                .build();
    }

    @Transactional
    public void removeRecipe(Long residentId, Long dishId) {
        CookLater cookLater = cookLaterRepository.findByResidentIdAndDishId(residentId, dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved recipe not found."));
        cookLaterRepository.delete(cookLater);
        log.info("Resident {} removed saved recipe for dish {}", residentId, dishId);
    }

    @Transactional(readOnly = true)
    public boolean isRecipeSaved(Long residentId, Long dishId) {
        return cookLaterRepository.existsByResidentIdAndDishId(residentId, dishId);
    }

    @Transactional(readOnly = true)
    public long getSavedCount(Long residentId) {
        return cookLaterRepository.countByResidentId(residentId);
    }
}
