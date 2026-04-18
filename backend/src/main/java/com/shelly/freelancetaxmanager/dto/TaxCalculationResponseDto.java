package com.shelly.freelancetaxmanager.dto;

import java.math.BigDecimal;
import java.util.List;

//what the backend sends back to the client as JSON.
//
// Example JSON output:
// {
//   "grossIncome": 60000.00,
//   "netIncome": 41688.00,
//   "totalTax": 18312.00,
//   "lineItems": [ ... ]
// }
public record TaxCalculationResponseDto(
        BigDecimal grossIncome,
        BigDecimal netIncome,
        BigDecimal totalTax,     // sum of all line items
        List<TaxLineItemDto> lineItems  // one entry per tax type
) {}
