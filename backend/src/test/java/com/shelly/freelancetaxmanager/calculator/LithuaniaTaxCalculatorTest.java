package com.shelly.freelancetaxmanager.calculator;

import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class LithuaniaTaxCalculatorTest {

    private LithuaniaTaxCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new LithuaniaTaxCalculator();
    }

    @Test
    void calculate_annualIncome_returnsCorrectTotalTax() {
        // taxable profit = 10000 * 0.70 = 7000
        // sodra base = 7000 * 0.90 = 6300
        // VSD = 6300 * 0.1252 = 788.76
        // PSD = 6300 * 0.0698 = 439.74
        // GPM = 7000 * 0.05 = 350.00
        // total = 1578.50
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("10000"), "annual", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.totalTax()).isEqualByComparingTo("1578.50");
    }

    @Test
    void calculate_annualIncome_returnsCorrectNetIncome() {
        // 10000 - 1578.50 = 8421.50
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("10000"), "annual", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.netIncome()).isEqualByComparingTo("8421.50");
    }

    @Test
    void calculate_monthlyIncome_convertsToAnnualBeforeCalculating() {
        // 5000 monthly → 60000 annual
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("5000"), "monthly", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.grossIncome()).isEqualByComparingTo("60000.00");
    }

    @Test
    void calculate_monthlyIncome_returnsCorrectNetIncome() {
        // annual = 60000, taxable profit = 42000, sodra base = 37800
        // VSD = 4732.56, PSD = 2638.44
        // GPM: 20000 * 5% = 1000 + 22000 * 20% = 4400 → 5400.00
        // total = 12771.00, net = 60000 - 12771.00 = 47229.00
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("5000"), "monthly", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.netIncome()).isEqualByComparingTo("47229.00");
    }

    @Test
    void calculate_matchesSodraOfficialExample() {
        // Verified against sodra.lt calculator: 5000 annual income
        // VSD = 394.38, PSD = 219.87, GPM = 175.00, total = 789.25
        TaxCalculationRequestDto request = new TaxCalculationRequestDto(
                new BigDecimal("5000"), "annual", "LT"
        );

        TaxCalculationResponseDto result = calculator.calculate(request);

        assertThat(result.totalTax()).isEqualByComparingTo("789.25");
        assertThat(result.netIncome()).isEqualByComparingTo("4210.75");
    }
}