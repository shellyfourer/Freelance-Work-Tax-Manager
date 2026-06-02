import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TaxCalculatorForm } from "./TaxCalculatorForm";

const defaultProps = {
  apiError: null,
  onFieldChange: vi.fn(),
};

describe("TaxCalculatorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders income input and country select", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    expect(screen.getByLabelText(/enter your income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select your country/i)).toBeInTheDocument();
  });

  test("displays apiError message when prop is provided", () => {
    render(<TaxCalculatorForm {...defaultProps} apiError="Something went wrong" />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("calls onFieldChange with typed income and default country", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });

    expect(defaultProps.onFieldChange).toHaveBeenCalledWith({
      incomeAmount: "50000",
      country: "LT",
    });
  });

  test("shows validation error when income is zero", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "0" },
    });

    expect(screen.getByText(/income must be greater than zero/i)).toBeInTheDocument();
  });

  test("shows validation error when income is negative", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "-100" },
    });

    expect(screen.getByText(/income must be greater than zero/i)).toBeInTheDocument();
  });

  test("does not show validation error when input is empty", () => {
    render(<TaxCalculatorForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "" },
    });

    expect(screen.queryByText(/income must be greater than zero/i)).not.toBeInTheDocument();
  });
});
