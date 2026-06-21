"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { FormModal } from "@/components/shared/FormModal";
import { createCompleteUser, getCurrentUser } from "@/lib/api/user";
import { cn } from "@/lib/utils";

const COUNTRIES = [{ value: "LT", label: "Lithuania" }];
const CURRENCIES = [{ value: "EUR", label: "EUR — Euro" }];

const inputClass = "h-12 rounded-input border-[1.5px] border-border";

interface FormValues {
  country: string;
  currency: string;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryFocusedIndex, setCountryFocusedIndex] = useState(-1);

  const [currencyQuery, setCurrencyQuery] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencyFocusedIndex, setCurrencyFocusedIndex] = useState(-1);

  const [apiError, setApiError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { country: "", currency: "" },
  });

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) {
        router.push("/login");
      } else if (user.setupComplete) {
        router.push("/");
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.label.toLowerCase().includes(countryQuery.toLowerCase()),
  );
  const filteredCurrencies = CURRENCIES.filter((c) =>
    c.label.toLowerCase().includes(currencyQuery.toLowerCase()),
  );

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      await createCompleteUser({ country: values.country, currency: values.currency });
      router.push("/");
    } catch {
      setApiError("Failed to save your setup. Please try again.");
    }
  }

  if (isCheckingAuth) return null;

  return (
    <FormModal
      open={true}
      title="Set up your account"
      isSubmitting={isSubmitting}
      isDirty={true}
      apiError={apiError}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => router.push("/login")}
    >
      {/* Country */}
      <div className="flex flex-col gap-2">
        <Label className="text-caption">Country</Label>
        <Controller
          name="country"
          control={control}
          rules={{ required: "Please select a country" }}
          render={({ field, fieldState }) => (
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverAnchor asChild>
                <Input
                  aria-label="Country"
                  autoComplete="off"
                  placeholder="Select country…"
                  aria-invalid={!!fieldState.error}
                  className={inputClass}
                  value={
                    countryOpen
                      ? countryQuery
                      : (COUNTRIES.find((c) => c.value === field.value)?.label ?? "")
                  }
                  onFocus={() => {
                    setCountryQuery("");
                    setCountryOpen(true);
                    setCountryFocusedIndex(-1);
                  }}
                  onChange={(e) => {
                    setCountryQuery(e.target.value);
                    setCountryOpen(true);
                    setCountryFocusedIndex(-1);
                    if (field.value) field.onChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!countryOpen) setCountryOpen(true);
                      setCountryFocusedIndex((prev) =>
                        Math.min(prev + 1, filteredCountries.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCountryFocusedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === "Enter" && countryOpen) {
                      e.preventDefault();
                      if (
                        countryFocusedIndex >= 0 &&
                        countryFocusedIndex < filteredCountries.length
                      ) {
                        const c = filteredCountries[countryFocusedIndex];
                        field.onChange(c.value);
                        setCountryQuery("");
                        setCountryOpen(false);
                        setCountryFocusedIndex(-1);
                      }
                    } else if (e.key === "Escape") {
                      setCountryQuery("");
                      setCountryOpen(false);
                      setCountryFocusedIndex(-1);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setCountryQuery("");
                      setCountryOpen(false);
                      setCountryFocusedIndex(-1);
                    }, 150);
                  }}
                />
              </PopoverAnchor>
              {countryOpen && filteredCountries.length > 0 && (
                <PopoverContent
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                >
                  {filteredCountries.map((c, index) => (
                    <button
                      key={c.value}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent",
                        field.value === c.value && "font-medium",
                        (countryFocusedIndex !== -1
                          ? countryFocusedIndex === index
                          : field.value === c.value) && "bg-accent",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        field.onChange(c.value);
                        setCountryQuery("");
                        setCountryOpen(false);
                        setCountryFocusedIndex(-1);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          )}
        />
      </div>

      {/* Currency */}
      <div className="flex flex-col gap-2">
        <Label className="text-caption">Currency</Label>
        <Controller
          name="currency"
          control={control}
          rules={{ required: "Please select a currency" }}
          render={({ field, fieldState }) => (
            <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
              <PopoverAnchor asChild>
                <Input
                  aria-label="Currency"
                  autoComplete="off"
                  placeholder="Select currency…"
                  aria-invalid={!!fieldState.error}
                  className={inputClass}
                  value={
                    currencyOpen
                      ? currencyQuery
                      : (CURRENCIES.find((c) => c.value === field.value)?.label ?? "")
                  }
                  onFocus={() => {
                    setCurrencyQuery("");
                    setCurrencyOpen(true);
                    setCurrencyFocusedIndex(-1);
                  }}
                  onChange={(e) => {
                    setCurrencyQuery(e.target.value);
                    setCurrencyOpen(true);
                    setCurrencyFocusedIndex(-1);
                    if (field.value) field.onChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!currencyOpen) setCurrencyOpen(true);
                      setCurrencyFocusedIndex((prev) =>
                        Math.min(prev + 1, filteredCurrencies.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCurrencyFocusedIndex((prev) => Math.max(prev - 1, 0));
                    } else if (e.key === "Enter" && currencyOpen) {
                      e.preventDefault();
                      if (
                        currencyFocusedIndex >= 0 &&
                        currencyFocusedIndex < filteredCurrencies.length
                      ) {
                        const c = filteredCurrencies[currencyFocusedIndex];
                        field.onChange(c.value);
                        setCurrencyQuery("");
                        setCurrencyOpen(false);
                        setCurrencyFocusedIndex(-1);
                      }
                    } else if (e.key === "Escape") {
                      setCurrencyQuery("");
                      setCurrencyOpen(false);
                      setCurrencyFocusedIndex(-1);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setCurrencyQuery("");
                      setCurrencyOpen(false);
                      setCurrencyFocusedIndex(-1);
                    }, 150);
                  }}
                />
              </PopoverAnchor>
              {currencyOpen && filteredCurrencies.length > 0 && (
                <PopoverContent
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                >
                  {filteredCurrencies.map((c, index) => (
                    <button
                      key={c.value}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent",
                        field.value === c.value && "font-medium",
                        (currencyFocusedIndex !== -1
                          ? currencyFocusedIndex === index
                          : field.value === c.value) && "bg-accent",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        field.onChange(c.value);
                        setCurrencyQuery("");
                        setCurrencyOpen(false);
                        setCurrencyFocusedIndex(-1);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          )}
        />
      </div>
    </FormModal>
  );
}
