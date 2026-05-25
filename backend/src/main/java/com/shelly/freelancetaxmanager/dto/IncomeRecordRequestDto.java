package com.shelly.freelancetaxmanager.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeRecordRequestDto(

    //for this sprint user and income source are set automatically
    // within the service so we do not need to send it in the request

    @NotNull @Positive BigDecimal amount,
    @NotNull LocalDate incomeDate,
    String description

){}
