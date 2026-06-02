package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.IncomeSourceRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeSourceResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.mapper.IncomeSourceMapper;
import com.shelly.freelancetaxmanager.service.IncomeSourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")

public class IncomeSourceController {

    private final IncomeSourceService incomeSourceService;

    public IncomeSourceController(IncomeSourceService incomeSourceService) {
        this.incomeSourceService = incomeSourceService;
    }

    @PostMapping
    public ResponseEntity<IncomeSourceResponseDto> createIncomeSource(
            @Valid @RequestBody IncomeSourceRequestDto incomeSourceRequestDto
    ) {
        IncomeSource entity = IncomeSourceMapper.toEntity(incomeSourceRequestDto);
        IncomeSource result = incomeSourceService.createIncomeSource(entity);
        return ResponseEntity.status(201).body(IncomeSourceMapper.toDto(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeSourceResponseDto> updateIncomeSource(
            @PathVariable Long id,
            @Valid @RequestBody IncomeSourceRequestDto incomeSourceRequestDto
    ) {
        IncomeSource entity = IncomeSourceMapper.toEntity(incomeSourceRequestDto);
        entity.setSourceId(id);
        IncomeSource result = incomeSourceService.updateIncomeSource(entity);
        return ResponseEntity.ok(IncomeSourceMapper.toDto(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncomeSource(
            @PathVariable Long id
    ) {
        incomeSourceService.deleteIncomeSource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeSourceResponseDto> getIncomeSourceById(
            @PathVariable Long id
    ) {
        IncomeSource result = incomeSourceService.getIncomeSourceById(id);
        return ResponseEntity.ok(IncomeSourceMapper.toDto(result));
    }

    @GetMapping
    public ResponseEntity<List<IncomeSourceResponseDto>> getIncomeSourcesByUser(
            @RequestParam Long userId
    ) {
        List<IncomeSourceResponseDto> result = incomeSourceService.getIncomeSourcesByUser(userId)
                .stream()
                .map(IncomeSourceMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }

}
