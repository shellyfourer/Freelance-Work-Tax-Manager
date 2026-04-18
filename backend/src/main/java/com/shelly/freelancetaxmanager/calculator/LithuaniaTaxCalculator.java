package com.shelly.freelancetaxmanager.calculator;

import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import com.shelly.freelancetaxmanager.dto.TaxLineItemDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;


@Component

public class LithuaniaTaxCalculator implements TaxCalculator {

    private static final BigDecimal GPM_RATE = new BigDecimal("0.15");
    private static final BigDecimal SODRA_RATE = new BigDecimal("0.1252");

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;


    @Override
    public TaxCalculationResponseDto calculate(TaxCalculationRequestDto request) {
        // If the user entered a monthly income, convert it to annual first.
        BigDecimal grossIncome = toAnnual(request.incomeAmount(), request.period());

        BigDecimal gpm = grossIncome.multiply(GPM_RATE).setScale(SCALE, ROUNDING);
        BigDecimal sodra = grossIncome.multiply(SODRA_RATE).setScale(SCALE, ROUNDING);

        BigDecimal totalTax = gpm.add(sodra);          // gpm + sodra
        BigDecimal netIncome = grossIncome.subtract(totalTax); // grossIncome - totalTax

        // List.of() = std::vector initialised with values in C++,
        List<TaxLineItemDto> lineItems = List.of(
                new TaxLineItemDto("Income Tax (GPM)", GPM_RATE, gpm),
                new TaxLineItemDto("Social Insurance (Sodra)", SODRA_RATE, sodra)
        );

        return new TaxCalculationResponseDto(grossIncome, netIncome, totalTax, lineItems);
    }

    //helper
    private BigDecimal toAnnual(BigDecimal amount, String period) {
        if ("monthly".equalsIgnoreCase(period)) {
            return amount.multiply(BigDecimal.valueOf(12)).setScale(SCALE, ROUNDING);
        }
        return amount.setScale(SCALE, ROUNDING);
    }
}
