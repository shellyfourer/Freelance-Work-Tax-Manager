"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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

//this is the dumb input layer

//needed to match DTO, this is what our form will give
export interface TaxFormValues {
  incomeAmount: string;
  country: string;
}

//THIS IS what we have to set in layout
interface TaxCalculatorFormProps {
  apiError: string | null;
  onFieldChange: (values: TaxFormValues) => void;
}

function validateIncome(value: string): string | null {
  if (!value) return null;
  const parsed = parseFloat(value.replace(/,/g, ""));
  if (isNaN(parsed) || parsed <= 0) return "Income must be greater than zero";
  return null;
}

//THIs is where we actually create the form
export function TaxCalculatorForm({ apiError, onFieldChange }: TaxCalculatorFormProps) {
  const [inputError, setInputError] = useState<string | null>(null);
  const { register, control, getValues } = useForm<TaxFormValues>({
    defaultValues: { incomeAmount: "", country: "LT" },
  });

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()}>
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
              aria-label="Income field"
              className="h-12 border-border bg-input-background"
              style={{
                borderRadius: "var(--radius-input)",
                fontSize: "var(--text-base)",
                borderWidth: "1.5px",
              }}
              {...register("incomeAmount", {
                onChange: (e) => {
                  const error = validateIncome(e.target.value);
                  setInputError(error);
                  onFieldChange({ incomeAmount: e.target.value, country: getValues("country") });
                },
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
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    onFieldChange({ incomeAmount: getValues("incomeAmount"), country: val });
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
                    <SelectItem value="LT">Lithuania</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {(inputError ?? apiError) && (
            <div
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-destructive bg-destructive/5"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="text-destructive" style={{ fontSize: "var(--text-caption)" }}>
                ⚠ {inputError ?? apiError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
