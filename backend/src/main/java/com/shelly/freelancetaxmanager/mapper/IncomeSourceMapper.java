package com.shelly.freelancetaxmanager.mapper;

import com.shelly.freelancetaxmanager.dto.IncomeSourceRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeSourceResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeSource;

public class IncomeSourceMapper {

    private IncomeSourceMapper() {}

    public static IncomeSource toEntity(IncomeSourceRequestDto dto) {
        IncomeSource source = new IncomeSource();
        source.setName(dto.name());
        source.setDescription(dto.description());
        source.setPaymentType(dto.paymentType());
        source.setHourlyRate(dto.hourlyRate());
        return source;
    }

    public static IncomeSourceResponseDto toDto(IncomeSource entity) {
        return new IncomeSourceResponseDto(
            entity.getSourceId(),
            entity.getName(),
            entity.getDescription(),
            entity.getPaymentType(),
            entity.getHourlyRate(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}