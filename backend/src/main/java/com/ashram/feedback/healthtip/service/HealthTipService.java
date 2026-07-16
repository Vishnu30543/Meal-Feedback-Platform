package com.ashram.feedback.healthtip.service;

import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.healthtip.dto.*;
import com.ashram.feedback.healthtip.entity.HealthTip;
import com.ashram.feedback.healthtip.repository.HealthTipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class HealthTipService {

    private final HealthTipRepository repository;

    @Transactional(readOnly = true)
    public List<HealthTipDto> getTodaysTips() {
        return repository.findTodaysTips(LocalDate.now()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<HealthTipDto> getAll(int page, int size) {
        Page<HealthTip> p = repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return PagedResponse.of(p.getContent().stream().map(this::toDto).collect(Collectors.toList()),
                page, size, p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public HealthTipDto getById(Long id) { return toDto(findOrThrow(id)); }

    @Transactional
    public HealthTipDto create(CreateHealthTipRequest req) {
        HealthTip h = HealthTip.builder().title(req.getTitle()).description(req.getDescription())
                .imageUrl(req.getImageUrl()).activeDate(req.getActiveDate())
                .priority(req.getPriority()).visible(req.isVisible()).build();
        return toDto(repository.save(h));
    }

    @Transactional
    public HealthTipDto update(Long id, CreateHealthTipRequest req) {
        HealthTip h = findOrThrow(id);
        h.setTitle(req.getTitle()); h.setDescription(req.getDescription());
        h.setImageUrl(req.getImageUrl()); h.setActiveDate(req.getActiveDate());
        h.setPriority(req.getPriority()); h.setVisible(req.isVisible());
        return toDto(repository.save(h));
    }

    @Transactional
    public void delete(Long id) { findOrThrow(id); repository.deleteById(id); }

    private HealthTip findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("HealthTip", "id", id));
    }

    private HealthTipDto toDto(HealthTip h) {
        return HealthTipDto.builder().id(h.getId()).title(h.getTitle()).description(h.getDescription())
                .imageUrl(h.getImageUrl()).activeDate(h.getActiveDate())
                .priority(h.getPriority()).visible(h.isVisible()).createdAt(h.getCreatedAt()).build();
    }
}
