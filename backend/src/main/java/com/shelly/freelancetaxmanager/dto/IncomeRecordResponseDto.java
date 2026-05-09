package com.shelly.freelancetaxmanager.dto;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IncomeRecordResponseDto(
        Long incomeId,
        String incomeSourceName,
        BigDecimal amount,
        String currency,
        LocalDate incomeDate,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
