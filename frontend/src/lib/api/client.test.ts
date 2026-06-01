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

describe("createIncomeSource", () => {
  test("calls POST /api/clients with the correct request body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createIncomeSource(mockRequest);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the created IncomeSource on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );

    const result = await createIncomeSource(mockRequest);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(createIncomeSource(mockRequest)).rejects.toThrow("Failed to create income source");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeSourcesByUser", () => {
  test("calls GET /api/clients?userId={id} with the correct URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([mockSource]) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeSourcesByUser(1);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/clients?userId=1");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns a list of IncomeSources on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([mockSource]) }),
    );

    const result = await getIncomeSourcesByUser(1);

    expect(result).toEqual([mockSource]);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(getIncomeSourcesByUser(1)).rejects.toThrow("Failed to fetch income sources");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeSourceById", () => {
  test("calls GET /api/clients/{id} with the correct URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeSourceById(1);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/clients/1");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the IncomeSource on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );

    const result = await getIncomeSourceById(1);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(getIncomeSourceById(1)).rejects.toThrow("Failed to fetch income source");

    vi.unstubAllGlobals();
  });
});

describe("updateIncomeSource", () => {
  test("calls PUT /api/clients/{id} with the correct request body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await updateIncomeSource(1, mockRequest);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/clients/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the updated IncomeSource on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockSource) }),
    );

    const result = await updateIncomeSource(1, mockRequest);

    expect(result).toEqual(mockSource);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(updateIncomeSource(1, mockRequest)).rejects.toThrow(
      "Failed to update income source",
    );

    vi.unstubAllGlobals();
  });
});

describe("deleteIncomeSource", () => {
  test("calls DELETE /api/clients/{id} with the correct URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await deleteIncomeSource(1);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/clients/1", {
      method: "DELETE",
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("resolves without a value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    await expect(deleteIncomeSource(1)).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(deleteIncomeSource(1)).rejects.toThrow("Failed to delete income source");

    vi.unstubAllGlobals();
  });
});