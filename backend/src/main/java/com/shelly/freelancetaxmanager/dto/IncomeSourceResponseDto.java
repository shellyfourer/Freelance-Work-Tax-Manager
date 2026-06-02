package com.shelly.freelancetaxmanager.dto;

import com.shelly.freelancetaxmanager.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record IncomeSourceResponseDto(
    Long sourceId,
    String name,
    String description,
    PaymentType paymentType,
    BigDecimal hourlyRate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}