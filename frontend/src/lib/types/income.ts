// Mirrors backend IncomeRecordRequestDto
export interface IncomeRecordRequest {
  amount: number;
  incomeDate: string;
  description?: string;
}

// Mirrors backend IncomeRecordResponseDto
export interface IncomeRecord {
  incomeId: number;
  incomeSourceName: string;
  amount: number;
  currency: string;
  incomeDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
