import type { User, UserSetupRequest } from "@/lib/types/user";
import { createCompleteUser, getCurrentUser } from "./user";

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

const okJson = (data: unknown) => ({
  ok: true,
  status: 200,
  headers: { get: () => null },
  json: () => Promise.resolve(data),
});
const okEmpty = () => ({
  ok: true,
  status: 204,
  headers: { get: () => null },
});
const errorRes = (status = 500) => ({
  ok: false,
  status,
  headers: { get: () => null },
  text: () => Promise.resolve(""),
});

describe("createCompleteUser", () => {
  test("calls POST /api/auth/setup with the correct URL and body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okEmpty());
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createCompleteUser(mockRequest);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/auth/setup");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(JSON.stringify(mockRequest));
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("resolves without a value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okEmpty()));

    await expect(createCompleteUser(mockRequest)).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes(500)));

    await expect(createCompleteUser(mockRequest)).rejects.toThrow("Failed to finalize user setup");

    vi.unstubAllGlobals();
  });
});

describe("getCurrentUser", () => {
  test("calls GET /api/auth/me with correct URL and credentials", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockUser));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getCurrentUser();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/auth/me");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the user on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockUser)));

    const result = await getCurrentUser();

    expect(result).toEqual(mockUser);

    vi.unstubAllGlobals();
  });

  test("returns null on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes(401)));

    const result = await getCurrentUser();

    expect(result).toBeNull();

    vi.unstubAllGlobals();
  });

  test("throws on other non-ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes(500)));

    await expect(getCurrentUser()).rejects.toThrow("Failed to fetch user");

    vi.unstubAllGlobals();
  });
});
