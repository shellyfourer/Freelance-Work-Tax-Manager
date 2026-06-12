import { calculateTax } from "./tax";
import type { TaxCalculatorInput, TaxCalculatorResult } from "@/lib/types/tax";

const mockInput: TaxCalculatorInput = {
  incomeAmount: 60000,
  period: "annual",
  country: "LT",
};

const mockResponse: TaxCalculatorResult = {
  grossIncome: 60000,
  netIncome: 41688,
  totalTax: 18312,
  lineItems: [
    { name: "Income Tax (GPM)", rate: 0.15, amount: 9000 },
    { name: "Social Security (Sodra)", rate: 0.1252, amount: 7512 },
  ],
};

describe("calculateTax", () => {
  test("calls POST /api/tax/calculate with the correct request body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await calculateTax(mockInput);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/tax/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incomeAmount: 60000, period: "annual", country: "LT" }),
      credentials: "include",
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mapped TaxCalculatorResult on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await calculateTax(mockInput);

    expect(result).toEqual(mockResponse);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(calculateTax(mockInput)).rejects.toThrow("Failed to calculate tax");

    vi.unstubAllGlobals();
  });
});
