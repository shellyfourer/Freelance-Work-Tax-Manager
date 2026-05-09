import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";

export async function calculateTax(input: TaxCalculatorInput): Promise<TaxCalculatorResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/tax/calculate`, {
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
