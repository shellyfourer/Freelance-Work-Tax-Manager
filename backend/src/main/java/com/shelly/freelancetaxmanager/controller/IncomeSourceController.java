package com.shelly.freelancetaxmanager.controller;

import com.shelly.freelancetaxmanager.dto.IncomeSourceRequestDto;
import com.shelly.freelancetaxmanager.dto.IncomeSourceResponseDto;
import com.shelly.freelancetaxmanager.entity.IncomeSource;
import com.shelly.freelancetaxmanager.entity.User;
import com.shelly.freelancetaxmanager.mapper.IncomeSourceMapper;
import com.shelly.freelancetaxmanager.service.IncomeSourceService;
import com.shelly.freelancetaxmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class IncomeSourceController {

    private final IncomeSourceService incomeSourceService;
    private final UserService userService;

    public IncomeSourceController(IncomeSourceService incomeSourceService, UserService userService) {
        this.incomeSourceService = incomeSourceService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<IncomeSourceResponseDto> createIncomeSource(
            @Valid @RequestBody IncomeSourceRequestDto incomeSourceRequestDto,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeSource entity = IncomeSourceMapper.toEntity(incomeSourceRequestDto);
        IncomeSource result = incomeSourceService.createIncomeSource(entity, user);
        return ResponseEntity.status(201).body(IncomeSourceMapper.toDto(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeSourceResponseDto> updateIncomeSource(
            @PathVariable Long id,
            @Valid @RequestBody IncomeSourceRequestDto incomeSourceRequestDto,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeSource entity = IncomeSourceMapper.toEntity(incomeSourceRequestDto);
        entity.setSourceId(id);
        IncomeSource result = incomeSourceService.updateIncomeSource(entity, user);
        return ResponseEntity.ok(IncomeSourceMapper.toDto(result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncomeSource(
            @PathVariable Long id,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        incomeSourceService.deleteIncomeSource(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeSourceResponseDto> getIncomeSourceById(
            @PathVariable Long id,
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        IncomeSource result = incomeSourceService.getIncomeSourceById(id, user);
        return ResponseEntity.ok(IncomeSourceMapper.toDto(result));
    }

    @GetMapping
    public ResponseEntity<List<IncomeSourceResponseDto>> getIncomeSourcesByUser(
            @AuthenticationPrincipal OidcUser oidcUser
    ) {
        User user = getUser(oidcUser);
        List<IncomeSourceResponseDto> result = incomeSourceService.getIncomeSourcesByUser(user)
                .stream()
                .map(IncomeSourceMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    private User getUser(OidcUser oidcUser) {
        return userService.findByGoogleId(oidcUser.getSubject());
    }
}