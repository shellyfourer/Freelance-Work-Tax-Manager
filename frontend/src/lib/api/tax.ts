import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";
import { mockCalculateTax } from "@/lib/mocks/tax";

// replace the mock call below with a fetch to POST /api/tax/calculate.
// All other files remain unchanged when that switch happens.
export async function calculateTax(input: TaxCalculatorInput): Promise<TaxCalculatorResult> {
  return mockCalculateTax(input);
}
