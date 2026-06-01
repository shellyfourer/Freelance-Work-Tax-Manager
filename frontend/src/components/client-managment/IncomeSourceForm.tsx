"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { FormModal } from "@/components/shared/FormModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { name: "", paymentType: "", hourlyRate: "", description: "" },
  });

  const paymentType = watch("paymentType");
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
          <Label className="text-caption">Payment Type</Label>
          <span className="text-muted-foreground text-caption">Required</span>
        </div>
        <Controller
          name="paymentType"
          control={control}
          rules={{ required: "Please select a payment type" }}
          render={({ field }) => (
            <Popover open={paymentTypeOpen} onOpenChange={setPaymentTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={paymentTypeOpen}
                  aria-invalid={!!errors.paymentType}
                  className={cn(inputClass, "w-full justify-between font-normal")}
                >
                  {field.value
                    ? PAYMENT_TYPES.find((t) => t.value === field.value)?.label
                    : "Select payment type…"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandList>
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {PAYMENT_TYPES.map((type) => (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={(val) => {
                            field.onChange(val.toUpperCase() as PaymentType);
                            setPaymentTypeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === type.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
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
