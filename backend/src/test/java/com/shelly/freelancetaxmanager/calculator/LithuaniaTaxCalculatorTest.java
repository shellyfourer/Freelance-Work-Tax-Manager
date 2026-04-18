package com.shelly.freelancetaxmanager.calculator;

import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

// LithuaniaTaxCalculator has no dependencies, so we just create it with new
class LithuaniaTaxCalculatorTest {

    private LithuaniaTaxCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new LithuaniaTaxCalculator();
    }

    @Test
    void calculate_annualIncome_returnsCorrectTotalTax() {
        // 10000 * (0.15 + 0.1252) = 2752.00
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("10000"), "annual", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.totalTax()).isEqualByComparingTo("2752.00");
    }

    @Test
    void calculate_annualIncome_returnsCorrectNetIncome() {
        // 10000 - 2752.00 = 7248.00
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("10000"), "annual", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.netIncome()).isEqualByComparingTo("7248.00");
    }

    @Test
    void calculate_monthlyIncome_convertsToAnnualBeforeCalculating() {
        // 5000 monthly is 60000 annual, grossIncome in result should be the annual figure
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("5000"), "monthly", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.grossIncome()).isEqualByComparingTo("60000.00");
    }

    @Test
    void calculate_monthlyIncome_returnsCorrectNetIncome() {
        // Annual = 60000, net = 60000 - (9000 + 7512) = 43488.00
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("5000"), "monthly", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.netIncome()).isEqualByComparingTo("43488.00");
    }
}