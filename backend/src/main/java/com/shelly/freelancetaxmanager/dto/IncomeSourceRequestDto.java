package com.shelly.freelancetaxmanager.dto;

import com.shelly.freelancetaxmanager.enums.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record IncomeSourceRequestDto(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 500) String description,
    @NotNull PaymentType paymentType,
    @Positive BigDecimal hourlyRate
) {}