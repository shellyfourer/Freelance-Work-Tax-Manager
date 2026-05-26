package com.shelly.freelancetaxmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

// "record" is very similar to a struct in C++ where all you want is to hold data.

// Fields are accesed as methods: request.incomeAmount(), request.period(), request.country().
// In C++ you'd access a struct member directly.

// This represents the JSON body the client POSTs to /api/tax/calculate:
//   { "incomeAmount": 5000, "period": "anual", "country": "LT" }

public record TaxCalculationRequestDto(


        //If these constraints are violated, Spring returns HTTP 400 before the method runs.
        @NotNull @Positive BigDecimal incomeAmount,

        // @NotBlank = @NotNull + not empty + not only whitespace.
        @NotBlank
        @Pattern(regexp = "monthly|annual", message = "Period must be 'monthly' or 'annual'")
        String period,

        // The country code tells the engine which calculator to use.
        //Only "LT" (Lithuania) is supported in the MVP.
        @NotBlank
        @Pattern(regexp = "[A-Z]{2}", message = "Country must be a 2-letter ISO code")
        String country

) {}
