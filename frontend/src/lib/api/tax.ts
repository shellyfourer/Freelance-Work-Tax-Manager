import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";
import { apiFetch, apiUrl, handleResponse } from "@/lib/api/apiFetch";

export async function calculateTax(input: TaxCalculatorInput): Promise<TaxCalculatorResult> {
  const res = await apiFetch(apiUrl("/tax/calculate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incomeAmount: input.incomeAmount,
      period: input.period,
      country: input.country,
    }),
  });
  return handleResponse<TaxCalculatorResult>(res, "Failed to calculate tax");
}
