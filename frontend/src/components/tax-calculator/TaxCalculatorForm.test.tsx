import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TaxCalculatorForm } from "./TaxCalculatorForm";

const defaultProps = {
  onSubmit: vi.fn(),
  isCalculating: false,
  apiError: null,
  onFormChange: vi.fn(),
};

describe("TaxCalculatorForm", () => {
  test("renders income input, country select, and submit button", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    expect(screen.getByLabelText(/enter your income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select your country/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /calculate/i })).toBeInTheDocument();
  });

  test("input field cannot be empty", async () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid income amount/i)).toBeInTheDocument();
    });
  });

  test("income cannot be negative", async () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "-100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/income must be greater than zero/i)).toBeInTheDocument();
    });
  });

  test("calls onSubmit with correct values when form is valid", async () => {
    const onSubmit = vi.fn();
    render(<TaxCalculatorForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calculate/i }));

    await waitFor(() => {
      // React Hook Form calls onSubmit(data, event) — only assert on the data argument
      expect(onSubmit).toHaveBeenCalledWith(
        { incomeAmount: "5000", country: "LT" },
        expect.anything(),
      );
    });
  });

  test("displays apiError message when prop is provided", () => {
    render(<TaxCalculatorForm {...defaultProps} apiError="Something went wrong" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("disables submit button when isCalculating is true", () => {
    render(<TaxCalculatorForm {...defaultProps} isCalculating={true} />);

    expect(screen.getByRole("button", { name: /calculating/i })).toBeDisabled();
  });
});
