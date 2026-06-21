import type { IncomeSource, IncomeSourceRequest } from "@/lib/types/client";
import { apiFetch, apiUrl, handleResponse } from "@/lib/api/apiFetch";

export async function createIncomeSource(data: IncomeSourceRequest): Promise<IncomeSource> {
  const res = await apiFetch(apiUrl("/clients"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<IncomeSource>(res, "Failed to create income source");
}

export async function getIncomeSourcesByUser(): Promise<IncomeSource[]> {
  const res = await apiFetch(apiUrl("/clients"));
  return handleResponse<IncomeSource[]>(res, "Failed to fetch income sources");
}

export async function getIncomeSourceById(id: number): Promise<IncomeSource> {
  const res = await apiFetch(apiUrl(`/clients/${id}`));
  return handleResponse<IncomeSource>(res, "Failed to fetch income source");
}

export async function updateIncomeSource(
  id: number,
  data: IncomeSourceRequest,
): Promise<IncomeSource> {
  const res = await apiFetch(apiUrl(`/clients/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<IncomeSource>(res, "Failed to update income source");
}

export async function deleteIncomeSource(id: number): Promise<void> {
  const res = await apiFetch(apiUrl(`/clients/${id}`), { method: "DELETE" });
  return handleResponse<void>(res, "Failed to delete income source");
}
