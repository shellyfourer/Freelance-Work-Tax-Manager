import { formatDate, formatAmount, calculateIncomeSummary } from "./income";
import type { IncomeRecord } from "@/lib/types/income";

const makeRecord = (amount: number): IncomeRecord => ({
  incomeId: 1,
  incomeSourceId: 1,
  incomeSourceName: "Default Source",
  amount,
  hoursWorked: null,
  incomeDate: "2026-01-15",
  description: "Freelance project",
  paymentType: "FIXED",
  hourlyRate: null,
  createdAt: "2026-01-15T10:00:00",
  updatedAt: "2026-01-15T10:00:00",
});

describe("formatDate", () => {
  test("formats ISO date to human-readable string", () => {
    expect(formatDate("2026-01-15")).toMatch(/Jan/);
    expect(formatDate("2026-01-15")).toMatch(/2026/);
  });

  test("formats end-of-year date correctly", () => {
    expect(formatDate("2026-12-31")).toMatch(/Dec/);
    expect(formatDate("2026-12-31")).toMatch(/31/);
  });
});

describe("formatAmount", () => {
  test("formats whole number with euro sign and two decimal places", () => {
    expect(formatAmount(1000)).toBe("€1,000.00");
  });

  test("formats decimal amount correctly", () => {
    expect(formatAmount(99.5)).toBe("€99.50");
  });

  test("formats zero correctly", () => {
    expect(formatAmount(0)).toBe("€0.00");
  });
});

describe("calculateIncomeSummary", () => {
  test("returns zeros when no records", () => {
    expect(calculateIncomeSummary([], 3)).toEqual({
      totalIncome: 0,
      monthlyAverage: 0,
      projectedYearEnd: 0,
    });
  });

  test("calculates total, monthly average and projection correctly", () => {
    const records = [makeRecord(3000), makeRecord(2000)];
    expect(calculateIncomeSummary(records, 5)).toEqual({
      totalIncome: 5000,
      monthlyAverage: 1000,
      projectedYearEnd: 12000,
    });
  });

  test("works correctly with a single month", () => {
    const records = [makeRecord(4000)];
    expect(calculateIncomeSummary(records, 1)).toEqual({
      totalIncome: 4000,
      monthlyAverage: 4000,
      projectedYearEnd: 48000,
    });
  });

  test("returns zero average and projection when elapsedMonths is 0", () => {
    const records = [makeRecord(5000)];
    expect(calculateIncomeSummary(records, 0)).toEqual({
      totalIncome: 5000,
      monthlyAverage: 0,
      projectedYearEnd: 0,
    });
  });
});