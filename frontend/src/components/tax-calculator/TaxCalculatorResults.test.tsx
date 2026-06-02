import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TaxCalculatorResults } from "./TaxCalculatorResults";
import type { TaxCalculatorResult } from "@/lib/types/tax";

const mockResult: TaxCalculatorResult = {
  grossIncome: 60000,
  netIncome: 41688,
  totalTax: 18312,
  lineItems: [
    { name: "Income Tax (GPM)", rate: 0.15, amount: 9000 },
    { name: "Social Security (Sodra)", rate: 0.1252, amount: 7512 },
  ],
};

describe("TaxCalculatorResults", () => {
  test("renders placeholder state when result is null", () => {
    render(<TaxCalculatorResults result={null} isCalculating={false} submittedIncome="" />);

    expect(
      screen.getByText(/results appear here after you enter information/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Applied tax rate: —")).toBeInTheDocument();
    expect(screen.getByText("Your net income after tax")).toBeInTheDocument();
  });

  test("renders loading state when isCalculating is true", () => {
    render(<TaxCalculatorResults result={null} isCalculating={true} submittedIncome="" />);

    expect(screen.getByText(/processing your input/i)).toBeInTheDocument();
  });

  test("renders gross income, net income, and total tax when result is provided", () => {
    render(
      <TaxCalculatorResults result={mockResult} isCalculating={false} submittedIncome="60000" />,
    );

    expect(screen.getByText("€18312.00")).toBeInTheDocument();
    expect(screen.getByText("€41688.00")).toBeInTheDocument();
    expect(screen.getByText(/based on your income/i)).toBeInTheDocument();
  });

  test("renders each line item when lineItems is non-empty", () => {
    render(
      <TaxCalculatorResults result={mockResult} isCalculating={false} submittedIncome="60000" />,
    );

    expect(screen.getByText("Income Tax (GPM)")).toBeInTheDocument();
    expect(screen.getByText("15.00%")).toBeInTheDocument();
    expect(screen.getByText("Social Security (Sodra)")).toBeInTheDocument();
    expect(screen.getByText("12.52%")).toBeInTheDocument();
  });

  test("renders no line items section when lineItems is empty", () => {
    const resultWithNoItems: TaxCalculatorResult = { ...mockResult, lineItems: [] };
    render(
      <TaxCalculatorResults
        result={resultWithNoItems}
        isCalculating={false}
        submittedIncome="60000"
      />,
    );

    expect(screen.queryByText("Income Tax (GPM)")).not.toBeInTheDocument();
    expect(screen.queryByText("Social Security (Sodra)")).not.toBeInTheDocument();
  });
});
