package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.IncomeRecordRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeRecordResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.mapper.IncomeRecordMapper;
import com.shelly.freelancetaxmanager.service.IncomeRecordService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income-records") //has to be plural following REST principles

public class IncomeRecordController {

    private final IncomeRecordService incomeRecordService;

    public IncomeRecordController(IncomeRecordService incomeRecordService) {
        this.incomeRecordService = incomeRecordService;
    }

    @PostMapping //following REST principles, the creation endpoint is not supposed to have a sep path
    public ResponseEntity<IncomeRecordResponseDto> createIncomeRecord(
            @Valid @RequestBody IncomeRecordRequestDto incomeRecordRequestDto
    ) {
        IncomeRecord entity = IncomeRecordMapper.toEntity(incomeRecordRequestDto);
        IncomeRecord result = incomeRecordService.createIncomeRecord(entity, incomeRecordRequestDto.incomeSourceId());
        return ResponseEntity.status(201).body(IncomeRecordMapper.toDto(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeRecordResponseDto> updateIncomeRecord(
            @PathVariable Long id, //we use this because the request dto doesn't have an id, so we need to pass it in manually with a pathvariable
            @Valid @RequestBody IncomeRecordRequestDto incomeRecordRequestDto
    ) {
        IncomeRecord entity = IncomeRecordMapper.toEntity(incomeRecordRequestDto);
        entity.setIncomeId(id);
        IncomeRecord result = incomeRecordService.updateIncomeRecord(entity, incomeRecordRequestDto.incomeSourceId());
        return ResponseEntity.ok(IncomeRecordMapper.toDto(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncomeRecord(
            @PathVariable Long id
    ) {
        incomeRecordService.deleteIncomeRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeRecordResponseDto> getIncomeRecordById(
            @PathVariable Long id
    ) {
        IncomeRecord result = incomeRecordService.getIncomeRecordById(id);
        return ResponseEntity.ok(IncomeRecordMapper.toDto(result));
    }

    @GetMapping
    public ResponseEntity<List<IncomeRecordResponseDto>> getIncomeRecordsByUser(
            @RequestParam Long userId
    ) {
        List<IncomeRecordResponseDto> result = incomeRecordService.getIncomeRecordsByUser(userId)
                .stream()
                .map(IncomeRecordMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }


}
