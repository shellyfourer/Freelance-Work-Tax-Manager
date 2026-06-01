"use client";

import { useState } from "react";
import { TaxCalculatorForm, type TaxFormValues } from "@/components/tax-calculator/TaxCalculatorForm";
import { TaxCalculatorResults } from "@/components/tax-calculator/TaxCalculatorResults";
import { calculateTax } from "@/lib/api/tax";
import type { TaxCalculatorResult } from "@/lib/types/tax";

export function TaxCalculatorLayout() {
  const [result, setResult] = useState<TaxCalculatorResult | null>(null); //stores api results
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null); //stores error messages if api fails
  const [submittedIncome, setSubmittedIncome] = useState(""); //specifically FOR DISPLAY in results

  //this is needed for the form to be cleared when the user types a new income
  const handleFormChange = () => {
    if (result !== null || error !== null) {
      setResult(null);
      setError(null);
      setSubmittedIncome("");
    }
  };

  const handleSubmit = async (data: TaxFormValues) => {
    const parsed = parseFloat(data.incomeAmount.replace(/,/g, ""));

    //VERY IMPORTANT, we need to clear the data befroe we make the API call
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const response = await calculateTax({
        incomeAmount: parsed,
        period: "annual",
        country: data.country,
      });
      setResult(response); //THIS IS FOR DISPLAY
      setSubmittedIncome(data.incomeAmount); //THIS IS FOR UI (this is the original user input)
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCalculating(false); //we always need to turn of the loading
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 md:px-8 py-10">
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
