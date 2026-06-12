import type { User, UserSetupRequest } from "@/lib/types/user";

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

//we need this to complete the user setup, everything else is controlled by google
//meaning we dont CREATE a user, just the setup

//but we need a way to navigate the user to the auth window

export const googleAuthUrl = `${getBaseUrl()}/oauth2/authorization/google`;

export async function createCompleteUser(data: UserSetupRequest): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/auth/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to finalize user setup");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch(`${getBaseUrl()}/api/auth/me`, {
    credentials: "include",
  });

  if (res.status === 401) return null;

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}
