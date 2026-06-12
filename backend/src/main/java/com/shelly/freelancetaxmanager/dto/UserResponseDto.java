package com.shelly.freelancetaxmanager.dto;

public record UserResponseDto(
        Long userId,
        String name,
        String email,
        String country,
        String currency,
        boolean setupComplete
) {}