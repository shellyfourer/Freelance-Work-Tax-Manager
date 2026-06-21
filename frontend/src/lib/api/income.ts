import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";
import { apiFetch, apiUrl, handleResponse } from "@/lib/api/apiFetch";

export async function createIncomeRecord(data: IncomeRecordRequest): Promise<IncomeRecord> {
  const res = await apiFetch(apiUrl("/income-records"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<IncomeRecord>(res, "Failed to create income record");
}

export async function getIncomeRecordsByUser(): Promise<IncomeRecord[]> {
  const res = await apiFetch(apiUrl("/income-records"));
  return handleResponse<IncomeRecord[]>(res, "Failed to fetch income records");
}

export async function updateIncomeRecord(
  id: number,
  data: IncomeRecordRequest,
): Promise<IncomeRecord> {
  const res = await apiFetch(apiUrl(`/income-records/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<IncomeRecord>(res, "Failed to update income record");
}

export async function deleteIncomeRecord(id: number): Promise<void> {
  const res = await apiFetch(apiUrl(`/income-records/${id}`), { method: "DELETE" });
  return handleResponse<void>(res, "Failed to delete income record");
}
