"use client";

import { useState, useEffect, useRef } from "react";
import {
  TaxCalculatorForm,
  type TaxFormValues,
} from "@/components/tax-calculator/TaxCalculatorForm";
import { TaxCalculatorResults } from "@/components/tax-calculator/TaxCalculatorResults";
import type { TaxCalculatorResult } from "@/lib/types/tax";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const WS_URL = apiUrl.replace(/^http/, "ws") + "/ws/tax-calculator";
const DEBOUNCE_MS = 500;
const LOADING_DELAY_MS = 500; //this, i think we need to move into a sep file and make it reusable,
//because I need all loading states to trigger after this delay so that there is no poor UX

export function TaxCalculatorLayout() {
  const [result, setResult] = useState<TaxCalculatorResult | null>(null); //stores api results
  const [isCalculating, setIsCalculating] = useState(false); //this flips when we send a websocket message and when the response arrives
  const [showLoading, setShowLoading] = useState(false); //only flips if isCalculating is true for 500ms
  const [error, setError] = useState<string | null>(null);
  const [submittedIncome, setSubmittedIncome] = useState(""); //specifically FOR DISPLAY in results

  const wsRef = useRef<WebSocket | null>(null); //holds the websocket connection
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIncomeRef = useRef<string>("");

  //loading timer effect
  useEffect(() => {
    if (isCalculating) {
      loadingTimerRef.current = setTimeout(() => setShowLoading(true), LOADING_DELAY_MS);
    } else {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      setShowLoading(false);
    }
  }, [isCalculating]);

  //where we actually set up websocket
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError("Calculation failed. Please try again.");
        } else {
          setResult(data);
          setSubmittedIncome(pendingIncomeRef.current);
          setError(null);
        }
      } catch {
        setError("Calculation failed. Please try again.");
      } finally {
        setIsCalculating(false);
      }
    };

    ws.onerror = () => {
      setIsCalculating(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleFieldChange = (values: TaxFormValues) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const parsed = parseFloat(values.incomeAmount.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0 || !values.country) {
      setResult(null);
      setError(null);
      setIsCalculating(false);
      setSubmittedIncome("");
      return;
    }

    debounceRef.current = setTimeout(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      setIsCalculating(true);
      setError(null);
      pendingIncomeRef.current = values.incomeAmount;

      ws.send(JSON.stringify({ incomeAmount: parsed, period: "annual", country: values.country }));
    }, DEBOUNCE_MS);
  };

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 md:px-8 py-10">
      <div className="w-full max-w-130 mb-8 text-center">
        <h1 style={{ fontSize: "var(--text-h2)" }}>Calculate your estimated tax obligations</h1>
      </div>

      <div className="w-full max-w-130 flex flex-col gap-4">
        <TaxCalculatorForm apiError={error} onFieldChange={handleFieldChange} />
        <TaxCalculatorResults
          result={result}
          isCalculating={showLoading}
          submittedIncome={submittedIncome}
        />
      </div>
    </div>
  );
}
