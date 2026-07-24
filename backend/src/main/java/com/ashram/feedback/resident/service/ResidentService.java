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

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
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
     * Create a new resident and optionally an initial camp.
     */
    @Transactional
    public ResidentDto createResident(CreateResidentRequest request) {
        if (residentRepository.existsByResidentCode(request.getResidentCode())) {
            throw new DuplicateResourceException("Resident", "residentCode", request.getResidentCode());
        }

        Resident resident = residentMapper.toEntity(request);
        if (resident.getDoj() == null) {
            resident.setDoj(LocalDate.now());
        }
        resident = residentRepository.save(resident);
        log.info("Created resident: {}", resident.getResidentCode());

        if (request.getDuration() != null && !request.getDuration().trim().isEmpty()) {
            Camp.CampDuration durationEnum = Camp.CampDuration.valueOf(request.getDuration().toUpperCase());
            LocalDate startDate = resident.getDoj();
            int days = durationEnum == Camp.CampDuration.CUSTOM && request.getCustomDays() != null 
                        ? request.getCustomDays() 
                        : durationEnum.getDays();
            
            Camp camp = Camp.builder()
                    .resident(resident)
                    .startDate(startDate)
                    .endDate(startDate.plusDays(days))
                    .duration(durationEnum)
                    .customDays(durationEnum == Camp.CampDuration.CUSTOM ? request.getCustomDays() : null)
                    .active(true)
                    .build();
            campRepository.save(camp);
        }

        return residentMapper.toDto(resident);
    }

    /**
     * Bulk upload residents from Excel (.xlsx) file.
     */
    @Transactional
    public int bulkUploadResidents(MultipartFile file) {
        int count = 0;
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Default column indices
            int idCol = 0, nameCol = 1, phoneCol = 2, durationCol = 3, dojCol = 4;
            
            // Map headers dynamically
            Row headerRow = sheet.getRow(0);
            if (headerRow != null) {
                for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                    String header = getCellStringValue(headerRow.getCell(c));
                    if (header == null) continue;
                    header = header.toUpperCase();
                    if (header.contains("ID")) idCol = c;
                    else if (header.contains("NAME")) nameCol = c;
                    else if (header.contains("PHONE")) phoneCol = c;
                    else if (header.contains("DOJ") || header.contains("JOIN")) dojCol = c;
                    else if (header.contains("DURATION") || header.contains("DAYS")) durationCol = c;
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // Skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell idCell = row.getCell(idCol);
                if (idCell == null || idCell.getCellType() == CellType.BLANK) continue;

                String residentCode = idCell.getCellType() == CellType.NUMERIC ? 
                        String.valueOf((long) idCell.getNumericCellValue()) : idCell.getStringCellValue();
                
                String name = getCellStringValue(row.getCell(nameCol));
                String phone = getCellStringValue(row.getCell(phoneCol));
                String durationStr = getCellStringValue(row.getCell(durationCol));

                // DOJ Parsing
                Cell dojCell = row.getCell(dojCol);
                LocalDate doj = LocalDate.now();
                if (dojCell != null) {
                    if (dojCell.getCellType() == CellType.NUMERIC && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(dojCell)) {
                        doj = dojCell.getLocalDateTimeCellValue().toLocalDate();
                    } else if (dojCell.getCellType() == CellType.STRING || dojCell.getCellType() == CellType.NUMERIC) {
                        String dateStr = dojCell.getCellType() == CellType.STRING ? 
                                dojCell.getStringCellValue() : String.valueOf((long) dojCell.getNumericCellValue());
                        LocalDate parsed = parseFlexibleDate(dateStr);
                        if (parsed != null) doj = parsed;
                    }
                }

                // Check if exists
                Resident resident;
                java.util.Optional<Resident> existingOpt = residentRepository.findByResidentCode(residentCode);
                if (existingOpt.isPresent()) {
                    Resident existing = existingOpt.get();
                    if (existing.isArchived()) {
                        // Unarchive and update
                        existing.setArchived(false);
                        if (name != null) existing.setName(name);
                        if (phone != null) existing.setPhone(phone);
                        if (doj != null) existing.setDoj(doj);
                        resident = residentRepository.save(existing);
                    } else {
                        continue; // Skip active existing to avoid duplicates in bulk upload
                    }
                } else {
                    resident = new Resident();
                    resident.setResidentCode(residentCode);
                    resident.setName(name);
                    resident.setPhone(phone);
                    resident.setDoj(doj);
                    resident = residentRepository.save(resident);
                }

                if (durationStr != null && !durationStr.trim().isEmpty()) {
                    Camp.CampDuration durationEnum = null;
                    Integer customDays = null;

                    // Match string to duration or custom
                    String durUpper = durationStr.trim().toUpperCase();
                    if (durUpper.equals("15") || durUpper.contains("FIFTEEN") || durUpper.contains("15 DAYS")) durationEnum = Camp.CampDuration.FIFTEEN;
                    else if (durUpper.equals("30") || durUpper.contains("THIRTY") || durUpper.contains("30 DAYS")) durationEnum = Camp.CampDuration.THIRTY;
                    else if (durUpper.equals("60") || durUpper.contains("SIXTY") || durUpper.contains("60 DAYS")) durationEnum = Camp.CampDuration.SIXTY;
                    else if (durUpper.equals("90") || durUpper.contains("NINETY") || durUpper.contains("90 DAYS")) durationEnum = Camp.CampDuration.NINETY;
                    else if (durUpper.contains("PERMANENT")) durationEnum = Camp.CampDuration.PERMANENT;
                    else {
                        durationEnum = Camp.CampDuration.CUSTOM;
                        try {
                            customDays = Integer.parseInt(durationStr.replaceAll("[^0-9]", ""));
                        } catch (Exception e) {
                            customDays = 30; // fallback if parse fails
                        }
                    }
                    LocalDate startDate = doj;
                    int days = durationEnum == Camp.CampDuration.CUSTOM && customDays != null ? customDays : durationEnum.getDays();
                    
                    Camp camp = Camp.builder()
                            .resident(resident)
                            .startDate(startDate)
                            .endDate(startDate.plusDays(days))
                            .duration(durationEnum)
                            .customDays(customDays)
                            .active(true)
                            .build();
                    campRepository.save(camp);
                }
                count++;
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to process Excel file: " + e.getMessage());
        }
        return count;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return cell.getStringCellValue();
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

    /**
     * Bulk archive residents.
     */
    @Transactional
    public int bulkArchiveResidents(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            residentRepository.findById(id).ifPresent(resident -> {
                if (!resident.isArchived()) {
                    resident.setArchived(true);
                    residentRepository.save(resident);
                }
            });
            count++;
        }
        log.info("Bulk archived {} residents", count);
        return count;
    }

    private Resident findResidentOrThrow(Long id) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", "id", id));
        if (resident.isArchived()) {
            throw new ResourceNotFoundException("Resident", "id", id);
        }
        return resident;
    }

    private LocalDate parseFlexibleDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        dateStr = dateStr.trim().replaceAll("\\s+", "-").replaceAll("/", "-");
        
        if (dateStr.matches("\\d+")) {
            try {
                long excelDays = Long.parseLong(dateStr);
                if (excelDays > 20000 && excelDays < 100000) {
                    return LocalDate.of(1899, 12, 30).plusDays(excelDays);
                }
            } catch (Exception ignored) {}
        }
        
        List<DateTimeFormatter> formatters = Arrays.asList(
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("MM-dd-yyyy")
        );
        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException ignored) {}
        }
        return null;
    }
}
