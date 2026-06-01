"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";

export interface IncomeRecordFormProps {
  open: boolean;
  editingRecord: IncomeRecord | null;
  isSubmitting: boolean;
  apiError: string | null;
  onSave: (data: IncomeRecordRequest) => void;
  onClose: () => void;
}

interface FormValues {
  amount: string;
  incomeDate: string;
  description: string;
}

const inputClass = "h-12 rounded-input border-[1.5px] border-border";

export function IncomeRecordForm({
  open,
  editingRecord,
  isSubmitting,
  apiError,
  onSave,
  onClose,
}: IncomeRecordFormProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { amount: "", incomeDate: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        editingRecord
          ? {
              amount: String(editingRecord.amount),
              incomeDate: editingRecord.incomeDate,
              description: editingRecord.description ?? "",
            }
          : { amount: "", incomeDate: "", description: "" },
      );
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [open, editingRecord, reset]);

  const onSubmit = (values: FormValues) => {
    onSave({
      amount: parseFloat(values.amount),
      incomeDate: values.incomeDate,
      description: values.description || undefined,
      incomeSourceId: editingRecord?.incomeSourceId ?? 1,
    });
  };

  const { ref: amountRegisterRef, ...amountRest } = register("amount", {
    required: "Enter a valid positive number",
    validate: (v) => {
      const n = parseFloat(v);
      return (!isNaN(n) && n > 0) || "Enter a valid positive number";
    },
  });

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
      {/* Amount */}
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
          {...amountRest}
          ref={(el) => {
            amountRegisterRef(el);
            firstInputRef.current = el;
          }}
        />
        {errors.amount && (
          <p className="text-caption text-destructive">⚠ {errors.amount.message}</p>
        )}
      </div>

      {/* Date */}
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

      {/* Description */}
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
    </FormModal>
  );
}
