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

    // 2026 rates
    private static final BigDecimal EXPENSE_DEDUCTION_RATE = new BigDecimal("0.30");
    private static final BigDecimal SODRA_BASE_RATE        = new BigDecimal("0.90");
    private static final BigDecimal VSD_RATE               = new BigDecimal("0.1252");
    private static final BigDecimal PSD_RATE               = new BigDecimal("0.0698");

    // Progressive GPM brackets (applied to taxable profit)
    private static final BigDecimal GPM_BRACKET_1_MAX  = new BigDecimal("20000");
    private static final BigDecimal GPM_BRACKET_2_MAX  = new BigDecimal("83237");
    private static final BigDecimal GPM_BRACKET_3_MAX  = new BigDecimal("138729");
    private static final BigDecimal GPM_RATE_5         = new BigDecimal("0.05");
    private static final BigDecimal GPM_RATE_20        = new BigDecimal("0.20");
    private static final BigDecimal GPM_RATE_25        = new BigDecimal("0.25");
    private static final BigDecimal GPM_RATE_32        = new BigDecimal("0.32");

    // VSD annual cap (without additional pension contribution)
    private static final BigDecimal VSD_MAX_BASE = new BigDecimal("99422.45");

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    @Override
    public TaxCalculationResponseDto calculate(TaxCalculationRequestDto request) {
        BigDecimal grossIncome = toAnnual(request.incomeAmount(), request.period());

        // Step 1: taxable profit after 30% standard expense deduction
        BigDecimal taxableProfit = grossIncome
                .multiply(BigDecimal.ONE.subtract(EXPENSE_DEDUCTION_RATE))
                .setScale(SCALE, ROUNDING);

        // Step 2: Sodra base = 90% of taxable profit, capped at VSD max base
        BigDecimal sodraBase = taxableProfit
                .multiply(SODRA_BASE_RATE)
                .setScale(SCALE, ROUNDING)
                .min(VSD_MAX_BASE);

        // Step 3: VSD and PSD on Sodra base
        BigDecimal vsd = sodraBase.multiply(VSD_RATE).setScale(SCALE, ROUNDING);
        BigDecimal psd = sodraBase.multiply(PSD_RATE).setScale(SCALE, ROUNDING);

        // Step 4: progressive GPM on taxable profit
        BigDecimal gpm = calculateGpm(taxableProfit);
        BigDecimal effectiveGpmRate = taxableProfit.compareTo(BigDecimal.ZERO) > 0
                ? gpm.divide(taxableProfit, 4, ROUNDING)
                : BigDecimal.ZERO;

        BigDecimal totalTax = vsd.add(psd).add(gpm);
        BigDecimal netIncome = grossIncome.subtract(totalTax).setScale(SCALE, ROUNDING);

        List<TaxLineItemDto> lineItems = List.of(
                new TaxLineItemDto("Social Insurance (VSD)", VSD_RATE, vsd),
                new TaxLineItemDto("Health Insurance (PSD)", PSD_RATE, psd),
                new TaxLineItemDto("Income Tax (GPM)", effectiveGpmRate, gpm)
        );

        return new TaxCalculationResponseDto(grossIncome, netIncome, totalTax, lineItems);
    }

    private BigDecimal calculateGpm(BigDecimal profit) {
        if (profit.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;

        BigDecimal tax = BigDecimal.ZERO;

        // 0 – 20,000: 5%
        BigDecimal inBracket1 = profit.min(GPM_BRACKET_1_MAX);
        tax = tax.add(inBracket1.multiply(GPM_RATE_5));
        if (profit.compareTo(GPM_BRACKET_1_MAX) <= 0) return tax.setScale(SCALE, ROUNDING);

        // 20,001 – 83,237: 20% (covers the "gradually increases" transitional range and the flat 20% range)
        BigDecimal inBracket2 = profit.min(GPM_BRACKET_2_MAX).subtract(GPM_BRACKET_1_MAX);
        tax = tax.add(inBracket2.multiply(GPM_RATE_20));
        if (profit.compareTo(GPM_BRACKET_2_MAX) <= 0) return tax.setScale(SCALE, ROUNDING);

        // 83,238 – 138,729: 25%
        BigDecimal inBracket3 = profit.min(GPM_BRACKET_3_MAX).subtract(GPM_BRACKET_2_MAX);
        tax = tax.add(inBracket3.multiply(GPM_RATE_25));
        if (profit.compareTo(GPM_BRACKET_3_MAX) <= 0) return tax.setScale(SCALE, ROUNDING);

        // 138,730+: 32%
        BigDecimal inBracket4 = profit.subtract(GPM_BRACKET_3_MAX);
        tax = tax.add(inBracket4.multiply(GPM_RATE_32));

        return tax.setScale(SCALE, ROUNDING);
    }

    private BigDecimal toAnnual(BigDecimal amount, String period) {
        if ("monthly".equalsIgnoreCase(period)) {
            return amount.multiply(BigDecimal.valueOf(12)).setScale(SCALE, ROUNDING);
        }
        return amount.setScale(SCALE, ROUNDING);
    }
}
