"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { FormModal } from "@/components/shared/FormModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { IncomeSource, IncomeSourceRequest, PaymentType } from "@/lib/types/client";

export interface IncomeSourceFormProps {
  open: boolean;
  editingSource: IncomeSource | null;
  isSubmitting: boolean;
  apiError: string | null;
  onSave: (data: IncomeSourceRequest) => void;
  onClose: () => void;
}

interface FormValues {
  name: string;
  paymentType: PaymentType | "";
  hourlyRate: string;
  description: string;
}

const inputClass = "h-12 rounded-input border-[1.5px] border-border";

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "FIXED", label: "Fixed price" },
  { value: "HOURLY", label: "Hourly rate" },
];

export function IncomeSourceForm({
  open,
  editingSource,
  isSubmitting,
  apiError,
  onSave,
  onClose,
}: IncomeSourceFormProps) {
  const [paymentTypeOpen, setPaymentTypeOpen] = useState(false);
  const [paymentQuery, setPaymentQuery] = useState("");
  const [paymentFocusedIndex, setPaymentFocusedIndex] = useState(-1);

  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { name: "", paymentType: "", hourlyRate: "", description: "" },
  });

  const paymentType = useWatch({ control, name: "paymentType", defaultValue: "" });
  const isHourly = paymentType === "HOURLY";

  useEffect(() => {
    if (open) {
      if (editingSource) {
        reset({
          name: editingSource.name,
          paymentType: editingSource.paymentType,
          hourlyRate: editingSource.hourlyRate != null ? String(editingSource.hourlyRate) : "",
          description: editingSource.description ?? "",
        });
      } else {
        reset({ name: "", paymentType: "", hourlyRate: "", description: "" });
      }
    }
  }, [open, editingSource, reset]);

  // When open: show what's typed (filter as user types). When closed: show selected label.
  const selectedLabel = PAYMENT_TYPES.find((t) => t.value === paymentType)?.label ?? "";
  const paymentDisplayValue = paymentTypeOpen ? paymentQuery : selectedLabel;

  const filteredTypes = PAYMENT_TYPES.filter((t) =>
    t.label.toLowerCase().includes(paymentQuery.toLowerCase()),
  );

  const onSubmit = (values: FormValues) => {
    onSave({
      name: values.name,
      paymentType: values.paymentType as PaymentType,
      hourlyRate: isHourly ? parseFloat(values.hourlyRate) : undefined,
      description: values.description || undefined,
    });
  };

  return (
    <FormModal
      open={open}
      title={editingSource ? "Edit Client" : "Add Client"}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      apiError={apiError}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
    >
      {/* Name */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="form-name" className="text-caption">
            Name
          </Label>
          <span className="text-muted-foreground text-caption">Required</span>
        </div>
        <Input
          id="form-name"
          type="text"
          aria-label="Name"
          placeholder="e.g. Acme Corp"
          aria-invalid={!!errors.name}
          className={inputClass}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-caption text-destructive">⚠ {errors.name.message}</p>}
      </div>

      {/* Payment type */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="form-payment-type" className="text-caption">
            Payment Type
          </Label>
          <span className="text-muted-foreground text-caption">Required</span>
        </div>
        <Controller
          name="paymentType"
          control={control}
          rules={{ required: "Please select a payment type" }}
          render={({ field }) => (
            <Popover open={paymentTypeOpen} onOpenChange={setPaymentTypeOpen}>
              <PopoverAnchor asChild>
                <Input
                  id="form-payment-type"
                  aria-label="Payment Type"
                  aria-invalid={!!errors.paymentType}
                  autoComplete="off"
                  placeholder="Select payment type…"
                  className={inputClass}
                  value={paymentDisplayValue}
                  onFocus={() => {
                    setPaymentQuery("");
                    setPaymentTypeOpen(true);
                    setPaymentFocusedIndex(-1);
                  }}
                  onChange={(e) => {
                    setPaymentQuery(e.target.value);
                    setPaymentTypeOpen(true);
                    setPaymentFocusedIndex(-1);
                    if (field.value) field.onChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!paymentTypeOpen) setPaymentTypeOpen(true);
                      setPaymentFocusedIndex((prev) =>
                        Math.min(prev + 1, filteredTypes.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setPaymentFocusedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === "Enter" && paymentTypeOpen) {
                      e.preventDefault();
                      if (paymentFocusedIndex >= 0 && paymentFocusedIndex < filteredTypes.length) {
                        const type = filteredTypes[paymentFocusedIndex];
                        field.onChange(type.value);
                        setPaymentQuery("");
                        setPaymentTypeOpen(false);
                        setPaymentFocusedIndex(-1);
                      }
                    } else if (e.key === "Escape") {
                      setPaymentQuery("");
                      setPaymentTypeOpen(false);
                      setPaymentFocusedIndex(-1);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setPaymentQuery("");
                      setPaymentTypeOpen(false);
                      setPaymentFocusedIndex(-1);
                    }, 150);
                  }}
                />
              </PopoverAnchor>
              {paymentTypeOpen && filteredTypes.length > 0 && (
                <PopoverContent
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                >
                  {filteredTypes.map((type, index) => (
                    <button
                      key={type.value}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent",
                        field.value === type.value && "font-medium",
                        (paymentFocusedIndex !== -1
                          ? paymentFocusedIndex === index
                          : field.value === type.value) && "bg-accent",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        field.onChange(type.value);
                        setPaymentQuery("");
                        setPaymentTypeOpen(false);
                        setPaymentFocusedIndex(-1);
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          )}
        />
        {errors.paymentType && (
          <p className="text-caption text-destructive">⚠ {errors.paymentType.message}</p>
        )}
      </div>

      {/* Hourly rate — only when HOURLY */}
      {isHourly && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="form-rate" className="text-caption">
              Hourly Rate (€)
            </Label>
            <span className="text-muted-foreground text-caption">Required</span>
          </div>
          <Input
            id="form-rate"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 85"
            aria-label="Hourly Rate"
            aria-invalid={!!errors.hourlyRate}
            className={inputClass}
            {...register("hourlyRate", {
              validate: (v) => {
                if (getValues("paymentType") !== "HOURLY") return true;
                if (!v || v.trim() === "") return "Hourly rate is required";
                const n = parseFloat(v);
                return (!isNaN(n) && n > 0) || "Enter a valid positive number";
              },
            })}
          />
          {errors.hourlyRate && (
            <p className="text-caption text-destructive">⚠ {errors.hourlyRate.message}</p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="form-description" className="text-caption">
          Description (optional)
        </Label>
        <Textarea
          id="form-description"
          aria-label="Description"
          placeholder="e.g. Long-term design retainer"
          className="rounded-input border-[1.5px] border-border resize-none"
          rows={3}
          {...register("description")}
        />
      </div>
    </FormModal>
  );
}
