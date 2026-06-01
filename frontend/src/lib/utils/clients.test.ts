import { formatRate, calculateClientSummary } from "./clients";
import type { IncomeSource } from "@/lib/types/client";

const makeSource = (
  paymentType: "HOURLY" | "FIXED",
  hourlyRate: number | null = null,
): IncomeSource => ({
  sourceId: 1,
  name: "Test Client",
  description: null,
  paymentType,
  hourlyRate,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
});

describe("formatRate", () => {
  test("formats rate with euro sign and /hr suffix", () => {
    expect(formatRate(75)).toBe("€75.00/hr");
  });

  test("formats rate with decimals", () => {
    expect(formatRate(99.5)).toBe("€99.50/hr");
  });
});

describe("calculateClientSummary", () => {
  test("returns zeros and nulls when no sources", () => {
    expect(calculateClientSummary([])).toEqual({
      totalClients: 0,
      hourlyClients: 0,
      fixedClients: 0,
      averageHourlyRate: null,
      highestHourlyRate: null,
    });
  });

  test("counts hourly and fixed clients correctly", () => {
    const sources = [
      makeSource("HOURLY", 50),
      makeSource("HOURLY", 100),
      makeSource("FIXED"),
    ];
    const result = calculateClientSummary(sources);
    expect(result.totalClients).toBe(3);
    expect(result.hourlyClients).toBe(2);
    expect(result.fixedClients).toBe(1);
  });

  test("calculates average and highest hourly rate", () => {
    const sources = [makeSource("HOURLY", 50), makeSource("HOURLY", 150)];
    const result = calculateClientSummary(sources);
    expect(result.averageHourlyRate).toBe(100);
    expect(result.highestHourlyRate).toBe(150);
  });

  test("returns null rates when all clients are fixed", () => {
    const sources = [makeSource("FIXED"), makeSource("FIXED")];
    const result = calculateClientSummary(sources);
    expect(result.averageHourlyRate).toBeNull();
    expect(result.highestHourlyRate).toBeNull();
  });

  test("ignores hourly clients without a rate set", () => {
    const sources = [makeSource("HOURLY", null), makeSource("HOURLY", 80)];
    const result = calculateClientSummary(sources);
    expect(result.averageHourlyRate).toBe(80);
    expect(result.highestHourlyRate).toBe(80);
  });
});