import {
  createIncomeSource,
  getIncomeSourcesByUser,
  getIncomeSourceById,
  updateIncomeSource,
  deleteIncomeSource,
} from "./client";
import type { IncomeSource, IncomeSourceRequest } from "@/lib/types/client";

const mockRequest: IncomeSourceRequest = {
  name: "Acme Corp",
  description: "Main client",
  paymentType: "HOURLY",
  hourlyRate: 75,
};

const mockSource: IncomeSource = {
  sourceId: 1,
  name: "Acme Corp",
  description: "Main client",
  paymentType: "HOURLY",
  hourlyRate: 75,
  createdAt: "2026-01-15T10:00:00",
  updatedAt: "2026-01-15T10:00:00",
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
const errorRes = () => ({
  ok: false,
  status: 500,
  headers: { get: () => null },
  text: () => Promise.resolve(""),
});

describe("createIncomeSource", () => {
  test("calls POST /api/clients with the correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockSource));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createIncomeSource(mockRequest);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/clients");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(JSON.stringify(mockRequest));
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the created IncomeSource on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockSource)));

    const result = await createIncomeSource(mockRequest);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(createIncomeSource(mockRequest)).rejects.toThrow("Failed to create income source");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeSourcesByUser", () => {
  test("calls GET /api/clients with credentials", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson([mockSource]));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeSourcesByUser();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/clients");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns a list of IncomeSources on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson([mockSource])));

    const result = await getIncomeSourcesByUser();

    expect(result).toEqual([mockSource]);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(getIncomeSourcesByUser()).rejects.toThrow("Failed to fetch income sources");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeSourceById", () => {
  test("calls GET /api/clients/{id} with the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockSource));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeSourceById(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/clients/1");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the IncomeSource on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockSource)));

    const result = await getIncomeSourceById(1);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(getIncomeSourceById(1)).rejects.toThrow("Failed to fetch income source");

    vi.unstubAllGlobals();
  });
});

describe("updateIncomeSource", () => {
  test("calls PUT /api/clients/{id} with the correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockSource));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await updateIncomeSource(1, mockRequest);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/clients/1");
    expect(options.method).toBe("PUT");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(JSON.stringify(mockRequest));
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the updated IncomeSource on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockSource)));

    const result = await updateIncomeSource(1, mockRequest);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(updateIncomeSource(1, mockRequest)).rejects.toThrow(
      "Failed to update income source",
    );

    vi.unstubAllGlobals();
  });
});

describe("deleteIncomeSource", () => {
  test("calls DELETE /api/clients/{id} with the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okEmpty());
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await deleteIncomeSource(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/clients/1");
    expect(options.method).toBe("DELETE");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("resolves without a value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okEmpty()));

    await expect(deleteIncomeSource(1)).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(deleteIncomeSource(1)).rejects.toThrow("Failed to delete income source");

    vi.unstubAllGlobals();
  });
});
