package com.ashram.feedback.announcement.service;

import com.ashram.feedback.announcement.dto.AnnouncementDto;
import com.ashram.feedback.announcement.dto.CreateAnnouncementRequest;
import com.ashram.feedback.announcement.entity.Announcement;
import com.ashram.feedback.announcement.repository.AnnouncementRepository;
import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository repository;

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getActiveAnnouncements() {
        return repository.findActiveAnnouncements(LocalDate.now()).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<AnnouncementDto> getAll(int page, int size) {
        Page<Announcement> p = repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return PagedResponse.of(p.getContent().stream().map(this::toDto).collect(Collectors.toList()),
                page, size, p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AnnouncementDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public AnnouncementDto create(CreateAnnouncementRequest req) {
        Announcement a = Announcement.builder().title(req.getTitle()).description(req.getDescription())
                .imageUrl(req.getImageUrl()).startDate(req.getStartDate()).endDate(req.getEndDate())
                .priority(req.getPriority()).visible(req.isVisible()).build();
        return toDto(repository.save(a));
    }

    @Transactional
    public AnnouncementDto update(Long id, CreateAnnouncementRequest req) {
        Announcement a = findOrThrow(id);
        a.setTitle(req.getTitle()); a.setDescription(req.getDescription());
        a.setImageUrl(req.getImageUrl()); a.setStartDate(req.getStartDate());
        a.setEndDate(req.getEndDate()); a.setPriority(req.getPriority()); a.setVisible(req.isVisible());
        return toDto(repository.save(a));
    }

    @Transactional
    public void delete(Long id) { findOrThrow(id); repository.deleteById(id); }

    private Announcement findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
    }

    private AnnouncementDto toDto(Announcement a) {
        return AnnouncementDto.builder().id(a.getId()).title(a.getTitle()).description(a.getDescription())
                .imageUrl(a.getImageUrl()).startDate(a.getStartDate()).endDate(a.getEndDate())
                .priority(a.getPriority()).visible(a.isVisible()).createdAt(a.getCreatedAt()).build();
    }
}
