import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function createIncomeRecord(data: IncomeRecordRequest): Promise<IncomeRecord> {
  const res = await fetch(`${getBaseUrl()}/api/income/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create income record");
  }

  return res.json();
}

export async function getIncomeRecordsByUser(userId: number): Promise<IncomeRecord[]> {
  const res = await fetch(`${getBaseUrl()}/api/income?userId=${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch income records");
  }

  return res.json();
}

export async function updateIncomeRecord(
  id: number,
  data: IncomeRecordRequest,
): Promise<IncomeRecord> {
  const res = await fetch(`${getBaseUrl()}/api/income/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update income record");
  }

  return res.json();
}

export async function deleteIncomeRecord(id: number): Promise<IncomeRecord> {
  const res = await fetch(`${getBaseUrl()}/api/income/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete income record");
  }

  return res.json();
}
