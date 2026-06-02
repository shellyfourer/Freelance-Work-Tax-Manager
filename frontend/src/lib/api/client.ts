import type { IncomeSource, IncomeSourceRequest } from "@/lib/types/client";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function createIncomeSource(data: IncomeSourceRequest): Promise<IncomeSource> {
  const res = await fetch(`${getBaseUrl()}/api/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create income source");
  }

  return res.json();
}

export async function getIncomeSourcesByUser(userId: number): Promise<IncomeSource[]> {
  const res = await fetch(`${getBaseUrl()}/api/clients?userId=${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch income sources");
  }

  return res.json();
}

export async function getIncomeSourceById(id: number): Promise<IncomeSource> {
  const res = await fetch(`${getBaseUrl()}/api/clients/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch income source");
  }

  return res.json();
}

export async function updateIncomeSource(
  id: number,
  data: IncomeSourceRequest,
): Promise<IncomeSource> {
  const res = await fetch(`${getBaseUrl()}/api/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update income source");
  }

  return res.json();
}

export async function deleteIncomeSource(id: number): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/clients/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete income source");
  }
}
