import {
  createIncomeRecord,
  getIncomeRecordsByUser,
  updateIncomeRecord,
  deleteIncomeRecord,
} from "./income";
import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";
import type { PaymentType } from "@/lib/types/client";

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

describe("createIncomeRecord", () => {
  test("calls POST /api/income-records with the correct request body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await createIncomeRecord(mockRequest);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/income-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the created IncomeRecord on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );

    const result = await createIncomeRecord(mockRequest);

    expect(result).toEqual(mockRecord);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(createIncomeRecord(mockRequest)).rejects.toThrow("Failed to create income record");

    vi.unstubAllGlobals();
  });
});

describe("getIncomeRecordsByUser", () => {
  test("calls GET /api/income-records?userId={id} with the correct URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([mockRecord]) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await getIncomeRecordsByUser(1);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/income-records?userId=1");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns a list of IncomeRecords on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([mockRecord]) }),
    );

    const result = await getIncomeRecordsByUser(1);

    expect(result).toEqual([mockRecord]);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(getIncomeRecordsByUser(1)).rejects.toThrow("Failed to fetch income records");

    vi.unstubAllGlobals();
  });
});

describe("updateIncomeRecord", () => {
  test("calls PUT /api/income-records/{id} with the correct request body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await updateIncomeRecord(1, mockRequest);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/income-records/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockRequest),
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the updated IncomeRecord on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );

    const result = await updateIncomeRecord(1, mockRequest);

    expect(result).toEqual(mockRecord);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(updateIncomeRecord(1, mockRequest)).rejects.toThrow(
      "Failed to update income record",
    );

    vi.unstubAllGlobals();
  });
});

describe("deleteIncomeRecord", () => {
  test("calls DELETE /api/income-records/{id} with the correct URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8080");

    await deleteIncomeRecord(1);

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/income-records/1", {
      method: "DELETE",
    });

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("returns the deleted IncomeRecord on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockRecord) }),
    );

    const result = await deleteIncomeRecord(1);

    expect(result).toEqual(mockRecord);

    vi.unstubAllGlobals();
  });

  test("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(deleteIncomeRecord(1)).rejects.toThrow("Failed to delete income record");

    vi.unstubAllGlobals();
  });
});
