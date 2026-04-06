"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TaxFormValues {
  income: string;
  country: string;
}

interface TaxCalculatorFormProps {
  onSubmit: (data: TaxFormValues) => void;
  isCalculating: boolean;
  apiError: string | null;
  onFormChange: () => void;
}

export function TaxCalculatorForm({
  onSubmit,
  isCalculating,
  apiError,
  onFormChange,
}: TaxCalculatorFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaxFormValues>({
    defaultValues: { income: "", country: "lithuania" },
  });

  const fieldError = errors.income?.message ?? errors.country?.message ?? apiError;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card
        className="ring-0 border-[1.5px] border-border"
        style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)" }}
      >
        <CardHeader className="pb-2">
          <CardTitle style={{ fontSize: "var(--text-h4)" }}>Your Income</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="income" style={{ fontSize: "var(--text-caption)" }}>
              Enter your income (yearly)
            </Label>
            <Input
              id="income"
              type="number"
              min="0"
              step="any"
              placeholder="Enter your income"
              aria-invalid={!!errors.income}
              className="h-12 border-border bg-input-background"
              style={{
                borderRadius: "var(--radius-input)",
                fontSize: "var(--text-base)",
                borderWidth: "1.5px",
              }}
              {...register("income", {
                required: "Please enter a valid income amount",
                validate: (val) => {
                  const parsed = parseFloat(String(val).replace(/,/g, ""));
                  if (isNaN(parsed) || parsed < 0) return "Please enter a valid income amount";
                  if (parsed === 0) return "Income must be greater than zero";
                  return true;
                },
                onChange: onFormChange,
              })}
            />
            <p className="text-muted-foreground" style={{ fontSize: "var(--text-caption)" }}>
              Enter a positive number
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="country" style={{ fontSize: "var(--text-caption)" }}>
              Select your country
            </Label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Please select a country" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    onFormChange();
                  }}
                >
                  <SelectTrigger
                    id="country"
                    className="w-full border-border bg-input-background"
                    style={{
                      height: "3rem",
                      borderRadius: "var(--radius-input)",
                      fontSize: "var(--text-base)",
                      borderWidth: "1.5px",
                    }}
                  >
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="ring-0 border-[1.5px] border-border w-[--radix-select-trigger-width]"
                    style={{ borderRadius: "var(--radius-card)" }}
                  >
                    <SelectItem value="lithuania">Lithuania</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {fieldError && (
            <div
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-destructive bg-destructive/5"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="text-destructive" style={{ fontSize: "var(--text-caption)" }}>
                ⚠ {fieldError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isCalculating}
            className="w-full h-13 disabled:opacity-70"
            style={{
              borderRadius: "var(--radius-button)",
              fontSize: "var(--text-base)",
              borderWidth: "1.5px",
              borderColor: "var(--border)",
            }}
          >
            {isCalculating ? "Calculating…" : "Calculate"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
