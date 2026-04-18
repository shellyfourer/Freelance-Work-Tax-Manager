package com.shelly.freelancetaxmanager.dto;

import java.math.BigDecimal;

// One row in the tax breakdown — name, rate, and computed amount.

// Example JSON: { "name": "Income Tax (GPM)", "rate": 0.15, "amount": 9000.00 }
public record TaxLineItemDto(
        String name,
        BigDecimal rate,
        BigDecimal amount
) {}


