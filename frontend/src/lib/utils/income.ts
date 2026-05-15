import type { IncomeRecord } from "@/lib/types/income";

export interface IncomeSummary {
  totalIncome: number;
  monthlyAverage: number;
  projectedYearEnd: number;
}

export function calculateSummary(records: IncomeRecord[], elapsedMonths: number): IncomeSummary {
  const totalIncome = records.reduce((sum, r) => sum + r.amount, 0);
  const monthlyAverage = elapsedMonths > 0 ? totalIncome / elapsedMonths : 0;
  const projectedYearEnd = monthlyAverage * 12;
  return { totalIncome, monthlyAverage, projectedYearEnd };
}
