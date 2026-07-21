package com.ashram.feedback.resident.mapper;

import com.ashram.feedback.resident.dto.CampDto;
import com.ashram.feedback.resident.dto.CreateResidentRequest;
import com.ashram.feedback.resident.dto.ResidentDto;
import com.ashram.feedback.resident.entity.Camp;
import com.ashram.feedback.resident.entity.Resident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResidentMapper {

    @Mapping(target = "camps", source = "camps")
    @Mapping(target = "activeCamp", expression = "java(toCampDto(resident.getActiveCamp()))")
    ResidentDto toDto(Resident resident);

    CampDto toCampDto(Camp camp);

    List<CampDto> toCampDtos(List<Camp> camps);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "camps", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "archived", ignore = true)
    Resident toEntity(CreateResidentRequest request);
}
