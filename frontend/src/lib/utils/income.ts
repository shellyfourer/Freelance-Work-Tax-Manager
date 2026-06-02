import type { IncomeRecord } from "@/lib/types/income";

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAmount(amount: number): string {
  return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface IncomeSummary {
  totalIncome: number;
  monthlyAverage: number;
  projectedYearEnd: number;
}

export function calculateIncomeSummary(
  records: IncomeRecord[],
  elapsedMonths: number,
): IncomeSummary {
  const totalIncome = records.reduce((sum, r) => sum + r.amount, 0);
  const monthlyAverage = elapsedMonths > 0 ? totalIncome / elapsedMonths : 0;
  const projectedYearEnd = monthlyAverage * 12;
  return { totalIncome, monthlyAverage, projectedYearEnd };
}
