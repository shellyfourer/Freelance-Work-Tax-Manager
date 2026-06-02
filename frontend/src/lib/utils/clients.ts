import type { IncomeSource } from "@/lib/types/client";

export function formatRate(rate: number): string {
  return `€${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr`;
}

export interface ClientSummary {
  totalClients: number;
  hourlyClients: number;
  fixedClients: number;
  averageHourlyRate: number | null;
  highestHourlyRate: number | null;
}

export function calculateClientSummary(sources: IncomeSource[]): ClientSummary {
  const totalClients = sources.length;
  const hourlyClients = sources.filter((s) => s.paymentType === "HOURLY").length;
  const fixedClients = sources.filter((s) => s.paymentType === "FIXED").length;
  const hourlyRates = sources
    .filter((s) => s.hourlyRate != null)
    .map((s) => s.hourlyRate as number);
  const averageHourlyRate =
    hourlyRates.length > 0 ? hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length : null;
  const highestHourlyRate = hourlyRates.length > 0 ? Math.max(...hourlyRates) : null;
  return { totalClients, hourlyClients, fixedClients, averageHourlyRate, highestHourlyRate };
}
