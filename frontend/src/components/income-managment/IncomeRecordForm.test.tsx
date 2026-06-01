import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IncomeRecordForm } from "./IncomeRecordForm";
import type { IncomeSource } from "@/lib/types/client";
import type { IncomeRecord } from "@/lib/types/income";

const FUTURE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();
const PAST = "2026-01-15";

const FIXED_SOURCE: IncomeSource = {
  sourceId: 1,
  name: "Acme Corp",
  description: null,
  paymentType: "FIXED",
  hourlyRate: null,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

const HOURLY_SOURCE: IncomeSource = {
  sourceId: 2,
  name: "Dev Studio",
  description: null,
  paymentType: "HOURLY",
  hourlyRate: 75,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

const defaultProps = {
  open: true,
  editingRecord: null,
  incomeSources: [FIXED_SOURCE, HOURLY_SOURCE],
  isSubmitting: false,
  apiError: null,
  onSave: vi.fn(),
  onClose: vi.fn(),
};

async function selectClient(name: string) {
  fireEvent.focus(screen.getByLabelText(/client/i));
  await waitFor(() => screen.getByText(name));
  fireEvent.click(screen.getByText(name));
}

describe("IncomeRecordForm", () => {
  test("before client is selected only the client input is shown", () => {
    render(<IncomeRecordForm {...defaultProps} />);

    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/income amount/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^hours$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^minutes$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/income date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
  });

  test("client is required", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/please select a client/i)).toBeInTheDocument();
    });
  });

  describe("fixed client", () => {
    test("shows amount, date and description after selecting fixed client", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");

      expect(screen.getByLabelText(/income amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/income date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/^hours$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^minutes$/i)).not.toBeInTheDocument();
    });

    test("amount cannot be empty", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/enter a valid positive number/i)).toBeInTheDocument();
      });
    });

    test("amount cannot be zero or negative", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "-100" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/enter a valid positive number/i)).toBeInTheDocument();
      });
    });

    test("calls onSave with correct values", async () => {
      const onSave = vi.fn();
      render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "5000" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Freelance work" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /save/i }).closest("form")!);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          incomeSourceId: 1,
          amount: 5000,
          hoursWorked: undefined,
          incomeDate: PAST,
          description: "Freelance work",
        });
      });
    });

    test("calls onSave with undefined description when empty", async () => {
      const onSave = vi.fn();
      render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "5000" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });

      fireEvent.submit(screen.getByRole("button", { name: /save/i }).closest("form")!);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ description: undefined }));
      });
    });
  });

  describe("hourly client", () => {
    test("shows hours and minutes fields, not amount input", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");

      expect(screen.getByLabelText(/^hours$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^minutes$/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/income amount/i)).not.toBeInTheDocument();
    });

    test("shows breakdown box in empty state immediately after client selected", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");

      expect(screen.getByText(/— hrs × €75\/hr/)).toBeInTheDocument();
    });

    test("breakdown updates as hours are entered", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/^hours$/i), { target: { value: "8" } });

      await waitFor(() => {
        expect(screen.getByText(/8\.00 hrs × €75\/hr/)).toBeInTheDocument();
        expect(screen.getByText(/600\.00/)).toBeInTheDocument();
      });
    });

    test("breakdown shows final decimal and amount when hours and minutes are entered", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/^hours$/i), { target: { value: "57" } });
      fireEvent.change(screen.getByLabelText(/^minutes$/i), { target: { value: "28" } });

      await waitFor(() => {
        expect(screen.getByText(/57\.47 hrs × €75\/hr/)).toBeInTheDocument();
      });
    });

    test("requires at least hours or minutes", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/enter at least 1 hour or 1 minute/i)).toBeInTheDocument();
      });
    });

    test("minutes must be 0–59", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/^hours$/i), { target: { value: "5" } });
      fireEvent.change(screen.getByLabelText(/^minutes$/i), { target: { value: "90" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/minutes must be 0–59/i)).toBeInTheDocument();
      });
    });

    test("calls onSave with whole hours only (no minutes)", async () => {
      const onSave = vi.fn();
      render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/^hours$/i), { target: { value: "8" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });

      fireEvent.submit(screen.getByRole("button", { name: /save/i }).closest("form")!);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          incomeSourceId: 2,
          amount: 600,
          hoursWorked: 8,
          incomeDate: PAST,
          description: undefined,
        });
      });
    });

    test("calls onSave with decimal hours when minutes are entered", async () => {
      const onSave = vi.fn();
      render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

      await selectClient("Dev Studio");
      fireEvent.change(screen.getByLabelText(/^hours$/i), { target: { value: "57" } });
      fireEvent.change(screen.getByLabelText(/^minutes$/i), { target: { value: "28" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });

      fireEvent.submit(screen.getByRole("button", { name: /save/i }).closest("form")!);

      await waitFor(() => {
        const call = onSave.mock.calls[0][0];
        // 57 + 28/60 = 57.4667, amount = 57.4667 * 75 = 4310.00
        expect(call.hoursWorked).toBeCloseTo(57.4667, 3);
        expect(call.amount).toBeCloseTo(4310.0, 1);
        expect(call.incomeSourceId).toBe(2);
      });
    });
  });

  describe("date validation", () => {
    test("date cannot be empty", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "1000" } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      });
    });

    test("date cannot be in the future", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");
      fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "1000" } });
      fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: FUTURE } });
      fireEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/date cannot be in the future/i)).toBeInTheDocument();
      });
    });
  });

  describe("editing", () => {
    test("pre-fills fields when editing a fixed record", () => {
      const editingRecord: IncomeRecord = {
        incomeId: 1,
        incomeSourceId: 1,
        incomeSourceName: "Acme Corp",
        amount: 3000,
        hoursWorked: null,
        incomeDate: PAST,
        description: "Consulting",
        paymentType: "FIXED",
        hourlyRate: null,
        createdAt: "2026-01-15T00:00:00Z",
        updatedAt: "2026-01-15T00:00:00Z",
      };
      render(<IncomeRecordForm {...defaultProps} editingRecord={editingRecord} />);

      expect(screen.getByLabelText(/client/i)).toHaveValue("Acme Corp");
      expect(screen.getByLabelText(/income amount/i)).toHaveValue(3000);
      expect(screen.getByLabelText(/income date/i)).toHaveValue(PAST);
      expect(screen.getByLabelText(/description/i)).toHaveValue("Consulting");
    });

    test("pre-fills hours and minutes when editing an hourly record", () => {
      const editingRecord: IncomeRecord = {
        incomeId: 2,
        incomeSourceId: 2,
        incomeSourceName: "Dev Studio",
        // 57 + 28/60 ≈ 57.4667
        amount: 4310,
        hoursWorked: 57 + 28 / 60,
        incomeDate: PAST,
        description: null,
        paymentType: "HOURLY",
        hourlyRate: 75,
        createdAt: "2026-01-15T00:00:00Z",
        updatedAt: "2026-01-15T00:00:00Z",
      };
      render(<IncomeRecordForm {...defaultProps} editingRecord={editingRecord} />);

      expect(screen.getByLabelText(/client/i)).toHaveValue("Dev Studio");
      expect(screen.getByLabelText(/^hours$/i)).toHaveValue(57);
      expect(screen.getByLabelText(/^minutes$/i)).toHaveValue(28);
    });
  });

  describe("modal behaviour", () => {
    test("disables save button when isSubmitting", () => {
      render(<IncomeRecordForm {...defaultProps} isSubmitting={true} />);

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });

    test("displays apiError when provided", () => {
      render(<IncomeRecordForm {...defaultProps} apiError="Something went wrong" />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test("shows discard confirmation when cancel clicked with dirty form", async () => {
      render(<IncomeRecordForm {...defaultProps} />);

      await selectClient("Acme Corp");
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.getByText(/discard changes/i)).toBeInTheDocument();
      });
    });

    test("calls onClose when cancel clicked with clean form", () => {
      const onClose = vi.fn();
      render(<IncomeRecordForm {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });
});
