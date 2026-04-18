package com.shelly.freelancetaxmanager.service;

import com.shelly.freelancetaxmanager.calculator.TaxCalculatorFactory;
import com.shelly.freelancetaxmanager.dto.TaxCalculationRequestDto;
import com.shelly.freelancetaxmanager.dto.TaxCalculationResponseDto;
import org.springframework.stereotype.Service;

// @Service = @Component but semantically marks this as the "business logic layer."
// Spring treats them identically

@Service
public class TaxService {

    // C++ equivalent: a const reference member, or just discipline.
    private final TaxCalculatorFactory calculatorFactory;

    // Constructor injection — Spring reads this constructor and automatically passes in the TaxCalculatorFactory singleton it already created.
    public TaxService(TaxCalculatorFactory calculatorFactory) {
        this.calculatorFactory = calculatorFactory;
    }

    public TaxCalculationResponseDto calculateTax(TaxCalculationRequestDto request) {
        //we request the country from the request, ask the factory for the right calculator, and then call calculate() on it.
        return calculatorFactory.resolve(request.country()).calculate(request);
    }
}

