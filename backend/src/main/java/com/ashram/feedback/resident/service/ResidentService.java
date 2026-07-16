package com.ashram.feedback.resident.service;

import com.ashram.feedback.common.dto.PagedResponse;
import com.ashram.feedback.common.exception.BusinessException;
import com.ashram.feedback.common.exception.DuplicateResourceException;
import com.ashram.feedback.common.exception.ResourceNotFoundException;
import com.ashram.feedback.resident.dto.*;
import com.ashram.feedback.resident.entity.Camp;
import com.ashram.feedback.resident.entity.Resident;
import com.ashram.feedback.resident.mapper.ResidentMapper;
import com.ashram.feedback.resident.repository.CampRepository;
import com.ashram.feedback.resident.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;
    private final CampRepository campRepository;
    private final ResidentMapper residentMapper;

    /**
     * Get all residents with search and pagination.
     */
    @Transactional(readOnly = true)
    public PagedResponse<ResidentDto> getAllResidents(String search, boolean activeCampOnly, int page, int size) {
        Page<Resident> residentPage = residentRepository.searchResidents(
                search, activeCampOnly, PageRequest.of(page, size, Sort.by("residentCode").ascending()));

        List<ResidentDto> content = residentPage.getContent().stream()
                .map(residentMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.of(content, page, size,
                residentPage.getTotalElements(), residentPage.getTotalPages());
    }

    /**
     * Get resident by ID with all camps.
     */
    @Transactional(readOnly = true)
    public ResidentDto getResidentById(Long id) {
        Resident resident = findResidentOrThrow(id);
        return residentMapper.toDto(resident);
    }

    /**
     * Get resident by code.
     */
    @Transactional(readOnly = true)
    public ResidentDto getResidentByCode(String code) {
        Resident resident = residentRepository.findByResidentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", "residentCode", code));
        return residentMapper.toDto(resident);
    }

    /**
     * Create a new resident.
     */
    @Transactional
    public ResidentDto createResident(CreateResidentRequest request) {
        if (residentRepository.existsByResidentCode(request.getResidentCode())) {
            throw new DuplicateResourceException("Resident", "residentCode", request.getResidentCode());
        }

        Resident resident = residentMapper.toEntity(request);
        resident = residentRepository.save(resident);
        log.info("Created resident: {}", resident.getResidentCode());

        return residentMapper.toDto(resident);
    }

    /**
     * Update resident info (name, phone — code is permanent).
     */
    @Transactional
    public ResidentDto updateResident(Long id, UpdateResidentRequest request) {
        Resident resident = findResidentOrThrow(id);

        if (request.getName() != null) {
            resident.setName(request.getName());
        }
        if (request.getPhone() != null) {
            resident.setPhone(request.getPhone());
        }

        resident = residentRepository.save(resident);
        log.info("Updated resident: {}", resident.getResidentCode());

        return residentMapper.toDto(resident);
    }

    /**
     * Add a new camp to a resident.
     */
    @Transactional
    public CampDto addCamp(Long residentId, CreateCampRequest request) {
        Resident resident = findResidentOrThrow(residentId);

        // Check for overlapping camp with same start date
        if (campRepository.findByResidentIdAndStartDate(residentId, request.getStartDate()).isPresent()) {
            throw new BusinessException("A camp already exists for this resident on the given start date.");
        }

        Camp camp = Camp.builder()
                .resident(resident)
                .startDate(request.getStartDate())
                .endDate(request.getStartDate().plusDays(request.getDuration().getDays()))
                .duration(request.getDuration())
                .active(true)
                .build();

        camp = campRepository.save(camp);
        log.info("Added camp for resident {}: {} to {}",
                resident.getResidentCode(), camp.getStartDate(), camp.getEndDate());

        return residentMapper.toCampDto(camp);
    }

    /**
     * Toggle camp active status.
     */
    @Transactional
    public CampDto toggleCampActive(Long residentId, Long campId) {
        findResidentOrThrow(residentId);

        Camp camp = campRepository.findById(campId)
                .orElseThrow(() -> new ResourceNotFoundException("Camp", "id", campId));

        if (!camp.getResident().getId().equals(residentId)) {
            throw new BusinessException("Camp does not belong to this resident.");
        }

        camp.setActive(!camp.isActive());
        camp = campRepository.save(camp);
        log.info("Toggled camp {} active status to: {}", campId, camp.isActive());

        return residentMapper.toCampDto(camp);
    }

    /**
     * Get all camps for a resident.
     */
    @Transactional(readOnly = true)
    public List<CampDto> getResidentCamps(Long residentId) {
        findResidentOrThrow(residentId);
        return campRepository.findByResidentIdOrderByStartDateDesc(residentId)
                .stream()
                .map(residentMapper::toCampDto)
                .collect(Collectors.toList());
    }

    /**
     * Toggle archive status of a resident.
     */
    @Transactional
    public ResidentDto archiveResident(Long id) {
        Resident resident = findResidentOrThrow(id);
        resident.setArchived(!resident.isArchived());
        resident = residentRepository.save(resident);
        log.info("Archived resident: {} (status: {})", resident.getResidentCode(), resident.isArchived());
        return residentMapper.toDto(resident);
    }

    private Resident findResidentOrThrow(Long id) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", "id", id));
        if (resident.isArchived()) {
            throw new ResourceNotFoundException("Resident", "id", id);
        }
        return resident;
    }
}
