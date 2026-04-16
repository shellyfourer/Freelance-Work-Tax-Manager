package com.shelly.freelancetaxmanager.calculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TaxCalculatorFactoryTest {

    private TaxCalculatorFactory factory;

    @BeforeEach
    void setUp() {
        factory = new TaxCalculatorFactory(new LithuaniaTaxCalculator());
    }

    @Test
    void resolve_returnsLithuaniaCalculator_forLtCountryCode() {
        // "lt" should resolve to a LithuaniaTaxCalculator
        // isInstanceOf checks the type — if the mapping in the factory breaks,
        // this test catches it before any other code ever runs.
        TaxCalculator result = factory.resolve("lt");

        assertThat(result).isInstanceOf(LithuaniaTaxCalculator.class);
    }

    @Test
    void resolve_throwsIllegalArgumentException_forUnsupportedCountry() {
        // assertThatThrownBy checks that calling the lambda throws an exception.
        // If no exception is thrown, the test fails.
        // hasMessageContaining("DE") verifies the error message names the bad country.
        assertThatThrownBy(() -> factory.resolve("DE"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("DE");
    }
}

