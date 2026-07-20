package com.ashram.feedback.resident.mapper;

import com.ashram.feedback.resident.dto.CampDto;
import com.ashram.feedback.resident.dto.CreateResidentRequest;
import com.ashram.feedback.resident.dto.ResidentDto;
import com.ashram.feedback.resident.entity.Camp;
import com.ashram.feedback.resident.entity.Resident;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-17T11:09:15+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ResidentMapperImpl implements ResidentMapper {

    @Override
    public ResidentDto toDto(Resident resident) {
        if ( resident == null ) {
            return null;
        }

        ResidentDto.ResidentDtoBuilder residentDto = ResidentDto.builder();

        residentDto.camps( toCampDtos( resident.getCamps() ) );
        residentDto.createdAt( resident.getCreatedAt() );
        residentDto.id( resident.getId() );
        residentDto.name( resident.getName() );
        residentDto.phone( resident.getPhone() );
        residentDto.residentCode( resident.getResidentCode() );
        residentDto.updatedAt( resident.getUpdatedAt() );

        residentDto.activeCamp( toCampDto(resident.getActiveCamp()) );

        return residentDto.build();
    }

    @Override
    public CampDto toCampDto(Camp camp) {
        if ( camp == null ) {
            return null;
        }

        CampDto.CampDtoBuilder campDto = CampDto.builder();

        campDto.active( camp.isActive() );
        campDto.createdAt( camp.getCreatedAt() );
        campDto.duration( camp.getDuration() );
        campDto.endDate( camp.getEndDate() );
        campDto.id( camp.getId() );
        campDto.startDate( camp.getStartDate() );

        return campDto.build();
    }

    @Override
    public List<CampDto> toCampDtos(List<Camp> camps) {
        if ( camps == null ) {
            return null;
        }

        List<CampDto> list = new ArrayList<CampDto>( camps.size() );
        for ( Camp camp : camps ) {
            list.add( toCampDto( camp ) );
        }

        return list;
    }

    @Override
    public Resident toEntity(CreateResidentRequest request) {
        if ( request == null ) {
            return null;
        }

        Resident.ResidentBuilder resident = Resident.builder();

        resident.name( request.getName() );
        resident.phone( request.getPhone() );
        resident.residentCode( request.getResidentCode() );

        return resident.build();
    }
}
