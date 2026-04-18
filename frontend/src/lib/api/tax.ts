import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";

export async function calculateTax(input: TaxCalculatorInput): Promise<TaxCalculatorResult> {
  const res = await fetch("http://localhost:8080/api/tax/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      incomeAmount: input.incomeAmount,
      period: input.period,
      country: input.country,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to calculate tax");
  }

  return res.json();
}
