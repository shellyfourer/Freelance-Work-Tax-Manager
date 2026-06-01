package com.shelly.freelancetaxmanager.dto;

import com.shelly.freelancetaxmanager.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IncomeRecordResponseDto(
    Long incomeId,
    Long incomeSourceId,
    String incomeSourceName,
    BigDecimal amount,
    BigDecimal hoursWorked,
    LocalDate incomeDate,
    String description,
    PaymentType paymentType,
    BigDecimal hourlyRate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}