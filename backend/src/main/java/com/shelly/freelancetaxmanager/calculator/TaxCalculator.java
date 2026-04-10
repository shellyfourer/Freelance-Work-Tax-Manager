package com.shelly.freelancetaxmanager.calculator;

import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;


// Why this matters: TaxService and TaxCalculatorFactory only ever reference
// TaxCalculator — not LithuaniaTaxCalculator directly. Adding a new country
// means adding a new class; nothing else changes
public interface TaxCalculator {
    TaxCalculationResponseDto calculate(TaxCalculationRequestDto request);
}