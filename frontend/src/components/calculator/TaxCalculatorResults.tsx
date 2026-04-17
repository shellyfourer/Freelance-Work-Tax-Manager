import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResultValue } from "@/components/calculator/ResultValue";
import type { TaxCalculatorResult } from "@/lib/types/tax";

// Currency symbol — will be country-driven later
const CURRENCY = "€";

//this is also how we initiate this function in the layout
interface TaxCalculatorResultsProps {
  result: TaxCalculatorResult | null;
  isCalculating: boolean;
  submittedIncome: string;
}

export function TaxCalculatorResults({
  result,
  isCalculating,
  submittedIncome,
}: TaxCalculatorResultsProps) {
  const taxRateLabel = result
    ? `Applied tax rate: ${((result.totalTax / result.grossIncome) * 100).toFixed(1)}%`
    : "Applied tax rate: —";

  const keepRateLabel = result
    ? `${((result.netIncome / result.grossIncome) * 100).toFixed(1)}% of your income`
    : "Your net income after tax";

  const subtitleText =
    result && submittedIncome
      ? `Based on your income: ${CURRENCY}${parseFloat(submittedIncome).toLocaleString()}`
      : isCalculating
        ? "Processing your input…"
        : "Results appear here after you click Calculate";
  const subtitleItalic = !result || !submittedIncome;

  return (
    <Card
      className="ring-0 border-[1.5px] border-border transition-opacity duration-300"
      style={{
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--elevation-sm)",
        opacity: result || isCalculating ? 1 : 0.55,
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle style={{ fontSize: "var(--text-h4)" }}>Your Results</CardTitle>
        <p
          className={`text-muted-foreground mt-1.5${subtitleItalic ? " italic" : ""}`}
          style={{ fontSize: "var(--text-caption)" }}
        >
          {subtitleText}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-muted-foreground" style={{ fontSize: "var(--text-base)" }}>
              Tax to set aside:
            </p>
            <span className="text-muted-foreground" style={{ fontSize: "var(--text-caption)" }}>
              {taxRateLabel}
            </span>
          </div>
          <ResultValue
            value={result ? `${CURRENCY}${result.totalTax.toFixed(2)}` : `${CURRENCY} —`}
            filled={!!result}
            prominent={false}
          />
        </div>
        {result && result.lineItems.length > 0 && (
          <div className="flex flex-col gap-2 pl-2 border-l-2 border-border">
            {result.lineItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-muted-foreground" style={{ fontSize: "var(--text-caption)" }}>
                    {item.name}
                  </p>
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: "var(--text-caption)", opacity: 0.7 }}
                  >
                    {(item.rate * 100).toFixed(2)}%
                  </span>
                </div>
                <span
                  className="text-muted-foreground shrink-0"
                  style={{ fontSize: "var(--text-caption)" }}
                >
                  {CURRENCY}
                  {item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
        <Separator className="opacity-50" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-foreground" style={{ fontSize: "var(--text-h4)" }}>
              You keep:
            </p>
            <span className="text-muted-foreground" style={{ fontSize: "var(--text-caption)" }}>
              {keepRateLabel}
            </span>
          </div>
          <ResultValue
            value={result ? `${CURRENCY}${result.netIncome.toFixed(2)}` : `${CURRENCY} —`}
            filled={!!result}
            prominent={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
