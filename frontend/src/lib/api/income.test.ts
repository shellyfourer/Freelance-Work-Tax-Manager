import {
  createIncomeRecord,
  getIncomeRecordsByUser,
  updateIncomeRecord,
  deleteIncomeRecord,
} from "./income";
import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";

const mockRequest: IncomeRecordRequest = {
  incomeSourceId: 1,
  hoursWorked: 0,
  amount: 1500,
  incomeDate: "2026-01-15",
  description: "Freelance project",
};

const mockRecord: IncomeRecord = {
  incomeId: 1,
  incomeSourceId: 1,
  incomeSourceName: "Default Source",
  amount: 1500,
  hoursWorked: null,
  incomeDate: "2026-01-15",
  description: "Freelance project",
  paymentType: "FIXED",
  hourlyRate: null,
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

describe("createIncomeRecord", () => {
  test("calls POST /api/income-records with the correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockRecord));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createIncomeRecord(mockRequest);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/income-records");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(JSON.stringify(mockRequest));
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the created IncomeRecord on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockRecord)));

    const result = await createIncomeRecord(mockRequest);

    expect(result).toEqual(mockRecord);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(createIncomeRecord(mockRequest)).rejects.toThrow("Failed to create income record");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeRecordsByUser", () => {
  test("calls GET /api/income-records with credentials", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson([mockRecord]));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeRecordsByUser();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/income-records");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns a list of IncomeRecords on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson([mockRecord])));

    const result = await getIncomeRecordsByUser();

    expect(result).toEqual([mockRecord]);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(getIncomeRecordsByUser()).rejects.toThrow("Failed to fetch income records");

    vi.unstubAllGlobals();
  });
});

describe("updateIncomeRecord", () => {
  test("calls PUT /api/income-records/{id} with the correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okJson(mockRecord));
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await updateIncomeRecord(1, mockRequest);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/income-records/1");
    expect(options.method).toBe("PUT");
    expect(options.credentials).toBe("include");
    expect(options.body).toBe(JSON.stringify(mockRequest));
    expect((options.headers as Headers).get("Content-Type")).toBe("application/json");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the updated IncomeRecord on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(mockRecord)));

    const result = await updateIncomeRecord(1, mockRequest);

    expect(result).toEqual(mockRecord);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(updateIncomeRecord(1, mockRequest)).rejects.toThrow(
      "Failed to update income record",
    );

    vi.unstubAllGlobals();
  });
});

describe("deleteIncomeRecord", () => {
  test("calls DELETE /api/income-records/{id} with the correct URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue(okEmpty());
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await deleteIncomeRecord(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/income-records/1");
    expect(options.method).toBe("DELETE");
    expect(options.credentials).toBe("include");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("resolves without a value on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okEmpty()));

    await expect(deleteIncomeRecord(1)).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errorRes()));

    await expect(deleteIncomeRecord(1)).rejects.toThrow("Failed to delete income record");

    vi.unstubAllGlobals();
  });
});
