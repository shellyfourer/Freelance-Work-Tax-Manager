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

const okJson = (data: unknown) => ({
  ok: true,
  status: 200,
  headers: { get: () => null },
  json: () => Promise.resolve(data),
});
const errorRes = () => ({
  ok: false,
  status: 500,
  headers: { get: () => null },
  text: () => Promise.resolve(""),
});

describe("calculateTax", () => {
  test("calls POST /api/tax/calculate with the correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockResponse));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await calculateTax(mockInput);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/tax/calculate");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(
      JSON.stringify({ incomeAmount: 60000, period: "annual", country: "LT" }),
    );
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns mapped TaxCalculatorResult on a successful response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockResponse)));

    const result = await calculateTax(mockInput);

    expect(result).toEqual(mockResponse);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(calculateTax(mockInput)).rejects.toThrow("Failed to calculate tax");

    vi.unstubAllGlobals();
  });
});
