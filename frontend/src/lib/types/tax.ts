export type TaxPeriod = "annual" | "monthly";

export interface TaxCalculatorInput {
  income: number;
  period: TaxPeriod;
}

export interface TaxLineItem {
  name: string;
  rate: number;
  amount: number;
}

export interface TaxCalculatorResult {
  grossIncome: number;
  netIncome: number;
  totalTax: number;
  lineItems: TaxLineItem[];
}
