import type { PaymentType } from "@/lib/types/client";

// Mirrors backend IncomeRecordRequestDto
export interface IncomeRecordRequest {
  amount: number;
  incomeDate: string;
  description?: string;
  hoursWorked?: number;
  incomeSourceId: number;
}

// Mirrors backend IncomeRecordResponseDto
export interface IncomeRecord {
  incomeId: number;
  incomeSourceId: number;
  incomeSourceName: string;
  amount: number;
  hoursWorked: number | null;
  incomeDate: string;
  description: string | null;
  paymentType: PaymentType;
  hourlyRate: number | null;
  createdAt: string;
  updatedAt: string;
}