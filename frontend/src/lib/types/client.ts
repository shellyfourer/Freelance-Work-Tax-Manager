export type PaymentType = "HOURLY" | "FIXED";

// Mirrors backend IncomeSourceRequestDto
export interface IncomeSourceRequest {
  name: string;
  description?: string;
  paymentType: PaymentType;
  hourlyRate?: number;
}

// Mirrors backend IncomeSourceResponseDto
export interface IncomeSource {
  sourceId: number;
  name: string;
  description: string | null;
  paymentType: PaymentType;
  hourlyRate: number | null;
  createdAt: string;
  updatedAt: string;
}
