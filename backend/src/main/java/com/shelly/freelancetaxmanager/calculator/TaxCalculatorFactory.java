package com.shelly.freelancetaxmanager.calculator;

import org.springframework.stereotype.Component;

import java.util.Map;

// Its only job: given a country code string, return the right TaxCalculator instance.
// It contains no tax logic.
@Component
public class TaxCalculatorFactory {


    //look up table
    private final Map<String, TaxCalculator> calculators;

    // This is the constructor. Spring calls it automatically at startup
    // and passes in the LithuaniaTaxCalculator it already created (because it's @Component).

    public TaxCalculatorFactory(LithuaniaTaxCalculator lithuaniaTaxCalculator) {
        // Map.of() = an immutable map literal.
        // Immutable means no entries can be added or removed after creation.
        this.calculators = Map.of(
                "LT", lithuaniaTaxCalculator
        );
    }

    // Given a country code, return the matching calculator.

    public TaxCalculator resolve(String country) {
        TaxCalculator calculator = calculators.get(country.toUpperCase());
        if (calculator == null) {
            throw new IllegalArgumentException("Unsupported country: " + country);
        }
        return calculator;
    }
}
