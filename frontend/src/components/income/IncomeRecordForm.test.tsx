import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IncomeRecordForm } from "./IncomeRecordForm";

const FUTURE = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const PAST = "2026-01-15";

const defaultProps = {
  open: true,
  editingRecord: null,
  isSubmitting: false,
  apiError: null,
  onSave: vi.fn(),
  onClose: vi.fn(),
};

describe("IncomeRecordForm", () => {
  test("renders amount, date, description fields, save button and cancel button", () => {
    render(<IncomeRecordForm {...defaultProps} />);

    expect(screen.getByLabelText(/income amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/income date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("amount field cannot be empty", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid positive number/i)).toBeInTheDocument();
    });
  });

  test("amount cannot be zero or negative", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "-100" } });
    fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/enter a valid positive number/i)).toBeInTheDocument();
    });
  });

  test("date field cannot be empty", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    });
  });

  test("date cannot be in the future", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: FUTURE } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/date cannot be in the future/i)).toBeInTheDocument();
    });
  });

  test("calls onSave with correct values on valid submit", async () => {
    const onSave = vi.fn();
    render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Freelance work" },
    });

    const form = screen.getByRole("button", { name: /save/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        amount: 5000,
        currency: "EUR",
        incomeDate: PAST,
        description: "Freelance work",
      });
    });
  });

  test("calls onSave with undefined description when description is empty", async () => {
    const onSave = vi.fn();
    render(<IncomeRecordForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText(/income date/i), { target: { value: PAST } });

    const form = screen.getByRole("button", { name: /save/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        amount: 5000,
        currency: "EUR",
        incomeDate: PAST,
        description: undefined,
      });
    });
  });

  test("disables save button when isSubmitting is true", () => {
    render(<IncomeRecordForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  test("displays apiError when prop is provided", () => {
    render(<IncomeRecordForm {...defaultProps} apiError="Something went wrong" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("pre-fills form fields when editingRecord is provided", () => {
    const editingRecord = {
      incomeId: 1,
      incomeSourceName: "Freelance",
      amount: 3000,
      currency: "EUR",
      incomeDate: PAST,
      description: "Consulting",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    };
    render(<IncomeRecordForm {...defaultProps} editingRecord={editingRecord} />);

    expect(screen.getByLabelText(/income amount/i)).toHaveValue(3000);
    expect(screen.getByLabelText(/income date/i)).toHaveValue(PAST);
    expect(screen.getByLabelText(/description/i)).toHaveValue("Consulting");
  });

  test("shows discard confirmation when cancel is clicked with dirty form", async () => {
    render(<IncomeRecordForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/income amount/i), { target: { value: "1000" } });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByText(/discard changes/i)).toBeInTheDocument();
    });
  });

  test("calls onClose when cancel is clicked with clean form", () => {
    const onClose = vi.fn();
    render(<IncomeRecordForm {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
