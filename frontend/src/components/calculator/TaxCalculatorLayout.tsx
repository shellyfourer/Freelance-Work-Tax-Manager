"use client";

import { useState } from "react";
import { TaxCalculatorForm, type TaxFormValues } from "@/components/calculator/TaxCalculatorForm";
import { TaxCalculatorResults } from "@/components/calculator/TaxCalculatorResults";
import { calculateTax } from "@/lib/api/tax";
import type { TaxCalculatorResult } from "@/lib/types/tax";

export function TaxCalculatorLayout() {
  const [result, setResult] = useState<TaxCalculatorResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedIncome, setSubmittedIncome] = useState("");

  const handleFormChange = () => {
    if (result !== null || error !== null) {
      setResult(null);
      setError(null);
      setSubmittedIncome("");
    }
  };

  const handleSubmit = async (data: TaxFormValues) => {
    const parsed = parseFloat(data.income.replace(/,/g, ""));

    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const response = await calculateTax({ income: parsed, period: "annual" });
      setResult(response);
      setSubmittedIncome(data.income);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-130 mb-8 text-center">
        <h1 style={{ fontSize: "var(--text-h2)" }}>Freelance Work &amp; Tax Manager</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "var(--text-caption)" }}>
          Enter your income to calculate your estimated tax obligations.
        </p>
      </div>

      <div className="w-full max-w-130 flex flex-col gap-4">
        <TaxCalculatorForm
          onSubmit={handleSubmit}
          isCalculating={isCalculating}
          apiError={error}
          onFormChange={handleFormChange}
        />
        <TaxCalculatorResults
          result={result}
          isCalculating={isCalculating}
          submittedIncome={submittedIncome}
        />
      </div>
    </div>
  );
}
