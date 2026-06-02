import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IncomeSourceForm } from "./IncomeSourceForm";
import type { IncomeSource } from "@/lib/types/client";

const defaultProps = {
  open: true,
  editingSource: null,
  isSubmitting: false,
  apiError: null,
  onSave: vi.fn(),
  onClose: vi.fn(),
};

const editingSource: IncomeSource = {
  sourceId: 1,
  name: "Acme Corp",
  description: "Design work",
  paymentType: "FIXED",
  hourlyRate: null,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
};

async function selectPaymentType(label: string) {
  fireEvent.focus(screen.getByLabelText(/payment type/i));
  await waitFor(() => screen.getByText(label));
  fireEvent.click(screen.getByText(label));
}

describe("IncomeSourceForm", () => {
  test("renders name, payment type, description fields and save/cancel buttons", () => {
    render(<IncomeSourceForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("name field is required", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  test("payment type is required", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/please select a payment type/i)).toBeInTheDocument();
    });
  });

  test("hourly rate field is hidden when no payment type is selected", () => {
    render(<IncomeSourceForm {...defaultProps} />);

    expect(screen.queryByLabelText(/hourly rate/i)).not.toBeInTheDocument();
  });

  test("hourly rate field appears when HOURLY is selected", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    await selectPaymentType("Hourly rate");

    expect(screen.getByLabelText(/hourly rate/i)).toBeInTheDocument();
  });

  test("hourly rate field is hidden when FIXED is selected", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    await selectPaymentType("Fixed price");

    expect(screen.queryByLabelText(/hourly rate/i)).not.toBeInTheDocument();
  });

  test("hourly rate is required when HOURLY is selected", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    await selectPaymentType("Hourly rate");
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/hourly rate is required/i)).toBeInTheDocument();
    });
  });

  test("hourly rate cannot be zero or negative", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    await selectPaymentType("Hourly rate");
    fireEvent.change(screen.getByLabelText(/hourly rate/i), { target: { value: "-50" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid positive number/i)).toBeInTheDocument();
    });
  });

  test("calls onSave with correct values for FIXED client", async () => {
    const onSave = vi.fn();
    render(<IncomeSourceForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    await selectPaymentType("Fixed price");
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Design work" } });

    const form = screen.getByRole("button", { name: /save/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Acme Corp",
        paymentType: "FIXED",
        hourlyRate: undefined,
        description: "Design work",
      });
    });
  });

  test("calls onSave with hourly rate for HOURLY client", async () => {
    const onSave = vi.fn();
    render(<IncomeSourceForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Dev Studio" } });
    await selectPaymentType("Hourly rate");
    fireEvent.change(screen.getByLabelText(/hourly rate/i), { target: { value: "85" } });

    const form = screen.getByRole("button", { name: /save/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Dev Studio",
        paymentType: "HOURLY",
        hourlyRate: 85,
        description: undefined,
      });
    });
  });

  test("calls onSave with undefined description when description is empty", async () => {
    const onSave = vi.fn();
    render(<IncomeSourceForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    await selectPaymentType("Fixed price");

    const form = screen.getByRole("button", { name: /save/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ description: undefined }));
    });
  });

  test("disables save button when isSubmitting is true", () => {
    render(<IncomeSourceForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  test("displays apiError when prop is provided", () => {
    render(<IncomeSourceForm {...defaultProps} apiError="Something went wrong" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("pre-fills form fields when editingSource is provided", () => {
    render(<IncomeSourceForm {...defaultProps} editingSource={editingSource} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue("Acme Corp");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Design work");
    expect(screen.getByLabelText(/payment type/i)).toHaveValue("Fixed price");
  });

  test("pre-fills hourly rate when editing an HOURLY source", () => {
    const hourlySource: IncomeSource = {
      ...editingSource,
      paymentType: "HOURLY",
      hourlyRate: 75,
    };
    render(<IncomeSourceForm {...defaultProps} editingSource={hourlySource} />);

    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(75);
  });

  test("shows discard confirmation when cancel is clicked with dirty form", async () => {
    render(<IncomeSourceForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByText(/discard changes/i)).toBeInTheDocument();
    });
  });

  test("calls onClose when cancel is clicked with clean form", () => {
    const onClose = vi.fn();
    render(<IncomeSourceForm {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
