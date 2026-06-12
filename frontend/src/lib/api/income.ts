import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function createIncomeRecord(data: IncomeRecordRequest): Promise<IncomeRecord> {
  const res = await fetch(`${getBaseUrl()}/api/income-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to create income record");
  }

  return res.json();
}

export async function getIncomeRecordsByUser(): Promise<IncomeRecord[]> {
  const res = await fetch(`${getBaseUrl()}/api/income-records`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch income records");
  }

  return res.json();
}

export async function updateIncomeRecord(
  id: number,
  data: IncomeRecordRequest,
): Promise<IncomeRecord> {
  const res = await fetch(`${getBaseUrl()}/api/income-records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to update income record");
  }

  return res.json();
}

export async function deleteIncomeRecord(id: number): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/income-records/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete income record");
  }
}
