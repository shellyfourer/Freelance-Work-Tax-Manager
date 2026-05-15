import { calculateSummary } from "./income";
import type { IncomeRecord } from "@/lib/types/income";

const makeRecord = (amount: number): IncomeRecord => ({
  incomeId: 1,
  incomeSourceName: "Freelance",
  amount,
  currency: "EUR",
  incomeDate: "2026-01-15",
  description: null,
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
});

describe("calculateSummary", () => {
  test("returns zeros when no records", () => {
    expect(calculateSummary([], 3)).toEqual({
      totalIncome: 0,
      monthlyAverage: 0,
      projectedYearEnd: 0,
    });
  });

  test("calculates total, monthly average and projection correctly", () => {
    const records = [makeRecord(3000), makeRecord(2000)];
    expect(calculateSummary(records, 5)).toEqual({
      totalIncome: 5000,
      monthlyAverage: 1000,
      projectedYearEnd: 12000,
    });
  });


  test("works correctly with a single month", () => {
    const records = [makeRecord(4000)];
    expect(calculateSummary(records, 1)).toEqual({
      totalIncome: 4000,
      monthlyAverage: 4000,
      projectedYearEnd: 48000,
    });
  });
});