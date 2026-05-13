"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
const buttonClass = "flex-1 h-12 cursor-pointer";

const cardContentClass =
  "w-full flex flex-col gap-5 p-6 rounded-modal border-[1.5px] border-border bg-card shadow-elevation-sm";

export function IncomeRecordForm({
  open,
  editingRecord,
  isSubmitting,
  apiError,
  onSave,
  onClose,
}: IncomeRecordFormProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

  const requestClose = () => {
    if (isDirty) setShowCancelConfirm(true);
    else onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showCancelConfirm) setShowCancelConfirm(false);
      else if (isDirty) setShowCancelConfirm(true);
      else onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, showCancelConfirm, isDirty, onClose]);

  const onSubmit = (values: FormValues) => {
    onSave({
      amount: parseFloat(values.amount),
      currency: "EUR",
      incomeDate: values.incomeDate,
      description: values.description || undefined,
    });
  };

  const { ref: amountRegisterRef, ...amountRest } = register("amount", {
    required: "Enter a valid positive number",
    validate: (v) => {
      const n = parseFloat(v);
      return (!isNaN(n) && n > 0) || "Enter a valid positive number";
    },
  });

  if (!open) return null;

  return (
    <>
      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="shadow-elevation-sm border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Your input will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t-0 bg-transparent mx-0 mb-0 px-0 pb-0 pt-0">
            <AlertDialogCancel className="cursor-pointer">Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onClose} className="cursor-pointer">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add / Edit modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45"
        onClick={requestClose}
      >
        <div className={cn(cardContentClass, "max-w-110")} onClick={(e) => e.stopPropagation()}>
          <p className="text-h4 text-foreground m-0">
            {editingRecord ? "Edit Income" : "Add Income"}
          </p>
          <Separator className="opacity-40" />

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
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
                aria-invalid={!!errors.incomeDate}
                className={inputClass}
                {...register("incomeDate", { required: "Date is required" })}
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
                placeholder="e.g. Website project, Freelance work"
                className={inputClass}
                {...register("description")}
              />
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-destructive">
                <p className="text-caption text-destructive">⚠ {apiError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className={buttonClass}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={requestClose}
                disabled={isSubmitting}
                className={buttonClass}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
