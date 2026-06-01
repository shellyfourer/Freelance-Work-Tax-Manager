package com.shelly.freelancetaxmanager.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeRecordRequestDto(
    @NotNull @Positive BigDecimal amount,
    @NotNull LocalDate incomeDate,
    @Size(max = 500, message = "Description must not exceed 500 characters") String description,
    @Positive BigDecimal hoursWorked
) {}