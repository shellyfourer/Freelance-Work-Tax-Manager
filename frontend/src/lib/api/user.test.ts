import type { User, UserSetupRequest } from "@/lib/types/user";
import { createCompleteUser, getCurrentUser, redirectToGoogleAuth } from "./user";

const mockRequest: UserSetupRequest = {
  country: "LT",
  currency: "EUR",
};

const mockUser: User = {
  userId: 1,
  name: "Test",
  email: "test@gmail.com",
  country: "",
  currency: "",
  setupComplete: false,
};

describe("redirectToGoogleAuth", () => {
  test("sets window.location.href to the Google auth URL", () => {
    vi.stubGlobal("location", { href: "" });
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    redirectToGoogleAuth();

    expect(window.location.href).toBe("http://localhost:8080/oauth2/authorization/google");
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
});

describe("createCompleteUser", () => {
  test("calls POST /api/auth/setup with the correct URL and body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createCompleteUser(mockRequest);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
      credentials: "include",
    });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("resolves without a value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    await expect(createCompleteUser(mockRequest)).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(createCompleteUser(mockRequest)).rejects.toThrow("Failed to finalize user setup");

    vi.unstubAllGlobals();
  });
});

describe("getCurrentUser", () => {
  test("calls GET /api/auth/me with correct URL and credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getCurrentUser();

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/me", {
      credentials: "include",
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the user on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUser) }),
    );

    const result = await getCurrentUser();

    expect(result).toEqual(mockUser);

    vi.unstubAllGlobals();
  });

  test("returns null on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    const result = await getCurrentUser();

    expect(result).toBeNull();

    vi.unstubAllGlobals();
  });

  test("throws on other non-ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(getCurrentUser()).rejects.toThrow("Failed to fetch user");

    vi.unstubAllGlobals();
  });
});
