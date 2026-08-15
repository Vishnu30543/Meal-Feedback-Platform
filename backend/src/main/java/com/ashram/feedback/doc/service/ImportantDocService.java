package com.ashram.feedback.doc.service;

import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.doc.dto.CreateImportantDocRequest;
import com.ashram.feedback.doc.dto.ImportantDocDto;
import com.ashram.feedback.doc.entity.ImportantDoc;
import com.ashram.feedback.doc.repository.ImportantDocRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor
public class ImportantDocService {

    private final ImportantDocRepository repository;

    @Transactional(readOnly = true)
    public List<ImportantDocDto> getVisible() {
        return repository.findByVisibleTrueOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ImportantDocDto> getAll(int page, int size) {
        Page<ImportantDoc> p = repository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return PagedResponse.of(
                p.getContent().stream().map(this::toDto).collect(Collectors.toList()),
                page, size, p.getTotalElements(), p.getTotalPages());
    }

    @Transactional(readOnly = true)
    public ImportantDocDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public ImportantDocDto create(CreateImportantDocRequest req) {
        ImportantDoc doc = ImportantDoc.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .url(req.getUrl())
                .docType(req.getDocType())
                .category(req.getCategory())
                .visible(req.isVisible())
                .build();
        return toDto(repository.save(doc));
    }

    @Transactional
    public ImportantDocDto update(Long id, CreateImportantDocRequest req) {
        ImportantDoc doc = findOrThrow(id);
        doc.setTitle(req.getTitle());
        doc.setDescription(req.getDescription());
        doc.setUrl(req.getUrl());
        doc.setDocType(req.getDocType());
        doc.setCategory(req.getCategory());
        doc.setVisible(req.isVisible());
        return toDto(repository.save(doc));
    }

    @Transactional
    public void delete(Long id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    private ImportantDoc findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ImportantDoc", "id", id));
    }

    private ImportantDocDto toDto(ImportantDoc d) {
        return ImportantDocDto.builder()
                .id(d.getId())
                .title(d.getTitle())
                .description(d.getDescription())
                .url(d.getUrl())
                .docType(d.getDocType())
                .category(d.getCategory())
                .visible(d.isVisible())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
