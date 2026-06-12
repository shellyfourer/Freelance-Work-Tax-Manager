package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.IncomeRecordRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeRecordResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeRecord;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.mapper.IncomeRecordMapper;
import com.shelly.freelancetaxmanager.service.IncomeRecordService;
import com.shelly.freelancetaxmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income-records") //has to be plural following REST principles

public class IncomeRecordController {

    private final IncomeRecordService incomeRecordService;
    private final UserService userService;

    public IncomeRecordController(IncomeRecordService incomeRecordService, UserService userService) {
        this.incomeRecordService = incomeRecordService;
        this.userService = userService;
    }

    @PostMapping //following REST principles, the creation endpoint is not supposed to have a sep path
    public ResponseEntity<IncomeRecordResponseDto> createIncomeRecord(
            @Valid @RequestBody IncomeRecordRequestDto incomeRecordRequestDto,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeRecord entity = IncomeRecordMapper.toEntity(incomeRecordRequestDto);
        IncomeRecord result = incomeRecordService.createIncomeRecord(entity, incomeRecordRequestDto.incomeSourceId(), user);
        return ResponseEntity.status(201).body(IncomeRecordMapper.toDto(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeRecordResponseDto> updateIncomeRecord(
            @PathVariable Long id, //we use this because the request dto doesn't have an id, so we need to pass it in manually with a pathvariable
            @Valid @RequestBody IncomeRecordRequestDto incomeRecordRequestDto,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeRecord entity = IncomeRecordMapper.toEntity(incomeRecordRequestDto);
        entity.setIncomeId(id);
        IncomeRecord result = incomeRecordService.updateIncomeRecord(entity, incomeRecordRequestDto.incomeSourceId(), user);
        return ResponseEntity.ok(IncomeRecordMapper.toDto(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncomeRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        incomeRecordService.deleteIncomeRecord(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeRecordResponseDto> getIncomeRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeRecord result = incomeRecordService.getIncomeRecordById(id, user);
        return ResponseEntity.ok(IncomeRecordMapper.toDto(result));
    }

    @GetMapping
    public ResponseEntity<List<IncomeRecordResponseDto>> getIncomeRecordsByUser(
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        List<IncomeRecordResponseDto> result = incomeRecordService.getIncomeRecordsByUser(user)
                .stream()
                .map(IncomeRecordMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    private User getUser(OidcUser oidcUser) {
        return userService.findByGoogleId(oidcUser.getSubject());
    }
}