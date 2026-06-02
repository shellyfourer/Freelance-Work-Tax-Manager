"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";
import type { IncomeSource } from "@/lib/types/client";

export interface IncomeRecordFormProps {
  open: boolean;
  editingRecord: IncomeRecord | null;
  incomeSources: IncomeSource[];
  isSubmitting: boolean;
  apiError: string | null;
  onSave: (data: IncomeRecordRequest) => void;
  onClose: () => void;
}

interface FormValues {
  incomeSourceId: string;
  amount: string;
  hours: string;
  minutes: string;
  incomeDate: string;
  description: string;
}

const inputClass = "h-12 rounded-input border-[1.5px] border-border";

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function decimalToHoursMinutes(decimal: number): { hours: number; minutes: number } {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return { hours, minutes };
}

export function IncomeRecordForm({
  open,
  editingRecord,
  incomeSources,
  isSubmitting,
  apiError,
  onSave,
  onClose,
}: IncomeRecordFormProps) {
  const [clientOpen, setClientOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [clientFocusedIndex, setClientFocusedIndex] = useState(-1);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      incomeSourceId: "",
      amount: "",
      hours: "",
      minutes: "",
      incomeDate: "",
      description: "",
    },
  });

  const incomeSourceId = useWatch({ control, name: "incomeSourceId", defaultValue: "" });
  const hoursRaw = useWatch({ control, name: "hours", defaultValue: "" });
  const minutesRaw = useWatch({ control, name: "minutes", defaultValue: "" });

  const selectedSource = incomeSources.find((s) => String(s.sourceId) === incomeSourceId) ?? null;
  const isHourly = selectedSource?.paymentType === "HOURLY";

  const hoursNum = parseInt(hoursRaw) || 0;
  const minutesNum = parseInt(minutesRaw) || 0;
  const hasTime = hoursNum > 0 || minutesNum > 0;
  const totalHoursDecimal = hoursNum + minutesNum / 60;
  const calculatedAmount =
    isHourly && selectedSource?.hourlyRate && hasTime
      ? totalHoursDecimal * selectedSource.hourlyRate
      : null;

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        const { hours, minutes } =
          editingRecord.hoursWorked != null
            ? decimalToHoursMinutes(editingRecord.hoursWorked)
            : { hours: 0, minutes: 0 };
        reset({
          incomeSourceId: String(editingRecord.incomeSourceId),
          amount: String(editingRecord.amount),
          hours: editingRecord.hoursWorked != null ? String(hours) : "",
          minutes: editingRecord.hoursWorked != null && minutes > 0 ? String(minutes) : "",
          incomeDate: editingRecord.incomeDate,
          description: editingRecord.description ?? "",
        });
      } else {
        reset({
          incomeSourceId: "",
          amount: "",
          hours: "",
          minutes: "",
          incomeDate: "",
          description: "",
        });
      }
    }
  }, [open, editingRecord, reset]);

  // When open: show what's typed (filter as user types). When closed: show selected name.
  const clientDisplayValue = clientOpen ? clientQuery : (selectedSource?.name ?? "");

  const filteredSources = incomeSources.filter((s) =>
    s.name.toLowerCase().includes(clientQuery.toLowerCase()),
  );

  const onSubmit = (values: FormValues) => {
    const h = parseInt(values.hours) || 0;
    const m = parseInt(values.minutes) || 0;
    const totalHours = h + m / 60;

    const hoursWorked = isHourly ? totalHours : undefined;
    const amount =
      isHourly && selectedSource?.hourlyRate
        ? totalHours * selectedSource.hourlyRate
        : parseFloat(values.amount);

    onSave({
      incomeSourceId: parseInt(values.incomeSourceId),
      amount,
      hoursWorked,
      incomeDate: values.incomeDate,
      description: values.description || undefined,
    });
  };

  return (
    <FormModal
      open={open}
      title={editingRecord ? "Edit Income" : "Add Income"}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      apiError={apiError}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
    >
      {/* Client */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="form-client" className="text-caption">
            Client
          </Label>
          <span className="text-muted-foreground text-caption">Required</span>
        </div>
        <Controller
          name="incomeSourceId"
          control={control}
          rules={{ required: "Please select a client" }}
          render={({ field }) => (
            <Popover open={clientOpen} onOpenChange={setClientOpen}>
              <PopoverAnchor asChild>
                <Input
                  id="form-client"
                  aria-label="Client"
                  aria-invalid={!!errors.incomeSourceId}
                  autoComplete="off"
                  placeholder="Search clients…"
                  className={inputClass}
                  value={clientDisplayValue}
                  onFocus={() => {
                    setClientQuery("");
                    setClientOpen(true);
                    setClientFocusedIndex(-1);
                  }}
                  onChange={(e) => {
                    setClientQuery(e.target.value);
                    setClientOpen(true);
                    setClientFocusedIndex(-1);
                    if (field.value) field.onChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!clientOpen) setClientOpen(true);
                      setClientFocusedIndex((prev) =>
                        Math.min(prev + 1, filteredSources.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setClientFocusedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === "Enter" && clientOpen) {
                      e.preventDefault();
                      if (clientFocusedIndex >= 0 && clientFocusedIndex < filteredSources.length) {
                        const source = filteredSources[clientFocusedIndex];
                        field.onChange(String(source.sourceId));
                        setClientQuery("");
                        setClientOpen(false);
                        setClientFocusedIndex(-1);
                      }
                    } else if (e.key === "Escape") {
                      setClientQuery("");
                      setClientOpen(false);
                      setClientFocusedIndex(-1);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setClientQuery("");
                      setClientOpen(false);
                      setClientFocusedIndex(-1);
                    }, 150);
                  }}
                />
              </PopoverAnchor>
              {clientOpen && filteredSources.length > 0 && (
                <PopoverContent
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                >
                  {filteredSources.map((source, index) => (
                    <button
                      key={source.sourceId}
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent",
                        field.value === String(source.sourceId) && "font-medium",
                        (clientFocusedIndex !== -1
                          ? clientFocusedIndex === index
                          : field.value === String(source.sourceId)) && "bg-accent",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        field.onChange(String(source.sourceId));
                        setClientQuery("");
                        setClientOpen(false);
                        setClientFocusedIndex(-1);
                      }}
                    >
                      <span>{source.name}</span>
                      <span className="text-caption text-muted-foreground pl-4">
                        {source.paymentType === "HOURLY" && source.hourlyRate != null
                          ? `€${source.hourlyRate}/hr`
                          : "Fixed"}
                      </span>
                    </button>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          )}
        />
        {errors.incomeSourceId && (
          <p className="text-caption text-destructive">⚠ {errors.incomeSourceId.message}</p>
        )}
      </div>

      {/* HOURLY: hours + minutes + breakdown */}
      {isHourly && selectedSource && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-caption">Time Worked</Label>
              <span className="text-muted-foreground text-caption">Required</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Input
                  id="form-hours"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  aria-label="Hours"
                  aria-invalid={!!errors.hours}
                  className={inputClass}
                  {...register("hours", {
                    validate: (v) => {
                      if (!isHourly) return true;
                      const h = parseInt(v) || 0;
                      const m = parseInt(minutesRaw) || 0;
                      if (h === 0 && m === 0) return "Enter at least 1 hour or 1 minute";
                      if (v && parseInt(v) < 0) return "Hours cannot be negative";
                      return true;
                    },
                  })}
                />
                <span className="text-caption text-muted-foreground text-center">hours</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Input
                  id="form-minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  placeholder="0"
                  aria-label="Minutes"
                  aria-invalid={!!errors.minutes}
                  className={inputClass}
                  {...register("minutes", {
                    validate: (v) => {
                      if (!v || v === "") return true;
                      const m = parseInt(v);
                      return (m >= 0 && m <= 59) || "Minutes must be 0–59";
                    },
                  })}
                />
                <span className="text-caption text-muted-foreground text-center">min (0–59)</span>
              </div>
            </div>
            {(errors.hours || errors.minutes) && (
              <p className="text-caption text-destructive">
                ⚠ {errors.hours?.message ?? errors.minutes?.message}
              </p>
            )}
          </div>

          {/* Cost breakdown box */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-card border-[1.5px] border-border bg-muted/40">
            <span className="text-caption text-muted-foreground">
              {hasTime ? fmt(totalHoursDecimal) : "—"} hrs × €{selectedSource.hourlyRate}/hr
            </span>
            <span
              className={cn(
                "text-base font-medium",
                calculatedAmount != null ? "text-foreground" : "text-muted-foreground italic",
              )}
            >
              {calculatedAmount != null ? `€${fmt(calculatedAmount)}` : "—"}
            </span>
          </div>
        </>
      )}

      {/* FIXED: amount input */}
      {selectedSource && !isHourly && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="form-amount" className="text-caption">
              Income Amount
            </Label>
            <span className="text-muted-foreground text-caption">Required</span>
          </div>
          <Input
            id="form-amount"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 5000"
            aria-label="Income Amount"
            aria-invalid={!!errors.amount}
            className={inputClass}
            {...register("amount", {
              validate: (v) => {
                if (isHourly) return true;
                if (!v || v.trim() === "") return "Enter a valid positive number";
                const n = parseFloat(v);
                return (!isNaN(n) && n > 0) || "Enter a valid positive number";
              },
            })}
          />
          {errors.amount && (
            <p className="text-caption text-destructive">⚠ {errors.amount.message}</p>
          )}
        </div>
      )}

      {/* Date and description — only after client is selected */}
      {selectedSource && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="form-date" className="text-caption">
                Income Date
              </Label>
              <span className="text-muted-foreground text-caption">Required</span>
            </div>
            <Input
              id="form-date"
              type="date"
              aria-label="Income Date"
              aria-invalid={!!errors.incomeDate}
              className={inputClass}
              {...register("incomeDate", {
                required: "Date is required",
                validate: (v) => {
                  const [year, month, day] = v.split("-").map(Number);
                  const inputDate = new Date(year, month - 1, day);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return inputDate <= today || "Date cannot be in the future";
                },
              })}
            />
            {errors.incomeDate && (
              <p className="text-caption text-destructive">⚠ {errors.incomeDate.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="form-description" className="text-caption">
              Description (optional)
            </Label>
            <Input
              id="form-description"
              type="text"
              aria-label="Description"
              placeholder="e.g. Website project, Freelance work"
              className={inputClass}
              {...register("description")}
            />
          </div>
        </>
      )}
    </FormModal>
  );
}
