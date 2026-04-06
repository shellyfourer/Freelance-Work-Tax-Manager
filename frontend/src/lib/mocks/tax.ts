import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";

// Simplified Lithuanian tax rates used for mock calculation.
// replace this with real backend computation.

const GPM_RATE = 0.15; // Personal income tax (GPM)
const SODRA_RATE = 0.1252; // Social insurance (Sodra)

export function mockCalculateTax(input: TaxCalculatorInput): TaxCalculatorResult {
  const annual = input.period === "monthly" ? input.income * 12 : input.income;

  const gpm = annual * GPM_RATE;
  const sodra = annual * SODRA_RATE;
  const totalTax = gpm + sodra;

  return {
    grossIncome: annual,
    netIncome: annual - totalTax,
    totalTax,
    lineItems: [
      { name: "Income Tax (GPM)", rate: GPM_RATE, amount: gpm },
      { name: "Social Insurance (Sodra)", rate: SODRA_RATE, amount: sodra },
    ],
  };
}
