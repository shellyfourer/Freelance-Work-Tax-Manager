import type { User, UserSetupRequest } from "@/lib/types/user";
import { apiFetch, apiUrl, handleResponse, BASE_URL } from "@/lib/api/apiFetch";

//we need this to complete the user setup, everything else is controlled by google
//meaning we dont CREATE a user, just the setup

//but we need a way to navigate the user to the auth window

export const googleAuthUrl = `${BASE_URL}/oauth2/authorization/google`;

export async function createCompleteUser(data: UserSetupRequest): Promise<void> {
  const res = await apiFetch(apiUrl("/auth/setup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<void>(res, "Failed to finalize user setup");
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await apiFetch(apiUrl("/auth/me"));
  if (res.status === 401) return null;
  return handleResponse<User>(res, "Failed to fetch user");
}
