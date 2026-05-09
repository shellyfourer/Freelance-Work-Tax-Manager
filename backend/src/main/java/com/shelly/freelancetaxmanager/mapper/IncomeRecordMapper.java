package com.shelly.freelancetaxmanager.mapper;

import com.shelly.freelancetaxmanager.dto.IncomeRecordRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeRecordResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeRecord;


public class IncomeRecordMapper {

    //I need to map the REQUEST Dto from the user toEntity
    //I need to map the response from server from the entity to the response DTO

    //we call this principle the mapper pattern, we create a mapper class that is responsible for mapping between the different layers of our application

    //this means that controller only interacts with the DTOs, and the service only interacts with the entities
    //this way we keep data intergrity, safety and separation of concerns

    //so service just calls the mapper, and the mapper calls the entity and the DTOs and controller knows nothing about the entities and the service knows nothing about the DTOs, they only interact with the mapper


    public static IncomeRecord toEntity(IncomeRecordRequestDto dto){
        IncomeRecord income = new IncomeRecord();

        income.setAmount(dto.amount());
        income.setCurrency(dto.currency());
        income.setIncomeDate(dto.incomeDate());
        income.setDescription(dto.description());

        return income;

    }

    public static IncomeRecordResponseDto toDto(IncomeRecord entity){

        return new IncomeRecordResponseDto(
            entity.getIncomeId(),
            entity.getIncomeSource().getName(),
            entity.getAmount(),
            entity.getCurrency(),
            entity.getIncomeDate(),
            entity.getDescription(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
