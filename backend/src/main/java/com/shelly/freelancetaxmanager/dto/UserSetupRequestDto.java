package com.shelly.freelancetaxmanager.dto;

import jakarta.validation.constraints.NotBlank;

public record UserSetupRequestDto(
        @NotBlank String country,
        @NotBlank String currency
) {}