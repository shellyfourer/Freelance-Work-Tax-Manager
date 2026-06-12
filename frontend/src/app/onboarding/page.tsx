"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { FormModal } from "@/components/shared/FormModal";
import { createCompleteUser, getCurrentUser } from "@/lib/api/user";
import { cn } from "@/lib/utils";

const COUNTRIES = [{ value: "LT", label: "Lithuania" }];
const CURRENCIES = [{ value: "EUR", label: "EUR — Euro" }];

const inputClass = "h-12 rounded-input border-[1.5px] border-border";

export default function OnboardingPage() {
  const router = useRouter();

  const [country, setCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryFocusedIndex, setCountryFocusedIndex] = useState(-1);

  const [currency, setCurrency] = useState("");
  const [currencyQuery, setCurrencyQuery] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencyFocusedIndex, setCurrencyFocusedIndex] = useState(-1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
  }, []);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.label.toLowerCase().includes(countryQuery.toLowerCase()),
  );
  const filteredCurrencies = CURRENCIES.filter((c) =>
    c.label.toLowerCase().includes(currencyQuery.toLowerCase()),
  );

  const countryLabel = COUNTRIES.find((c) => c.value === country)?.label ?? "";
  const currencyLabel = CURRENCIES.find((c) => c.value === currency)?.label ?? "";

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    try {
      await createCompleteUser({ country, currency });
      router.push("/");
    } catch {
      setApiError("Failed to save your setup. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      onSubmit={handleSubmit}
      onClose={() => router.push("/login")}
    >
      {/* Country */}
      <div className="flex flex-col gap-2">
        <Label className="text-caption">Country</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverAnchor asChild>
            <Input
              aria-label="Country"
              autoComplete="off"
              placeholder="Select country…"
              className={inputClass}
              value={countryOpen ? countryQuery : countryLabel}
              onFocus={() => {
                setCountryQuery("");
                setCountryOpen(true);
                setCountryFocusedIndex(-1);
              }}
              onChange={(e) => {
                setCountryQuery(e.target.value);
                setCountryOpen(true);
                setCountryFocusedIndex(-1);
                if (country) setCountry("");
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
                  if (countryFocusedIndex >= 0 && countryFocusedIndex < filteredCountries.length) {
                    const c = filteredCountries[countryFocusedIndex];
                    setCountry(c.value);
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
                    country === c.value && "font-medium",
                    (countryFocusedIndex !== -1
                      ? countryFocusedIndex === index
                      : country === c.value) && "bg-accent",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCountry(c.value);
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
      </div>

      {/* Currency */}
      <div className="flex flex-col gap-2">
        <Label className="text-caption">Currency</Label>
        <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
          <PopoverAnchor asChild>
            <Input
              aria-label="Currency"
              autoComplete="off"
              placeholder="Select currency…"
              className={inputClass}
              value={currencyOpen ? currencyQuery : currencyLabel}
              onFocus={() => {
                setCurrencyQuery("");
                setCurrencyOpen(true);
                setCurrencyFocusedIndex(-1);
              }}
              onChange={(e) => {
                setCurrencyQuery(e.target.value);
                setCurrencyOpen(true);
                setCurrencyFocusedIndex(-1);
                if (currency) setCurrency("");
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
                    setCurrency(c.value);
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
                    currency === c.value && "font-medium",
                    (currencyFocusedIndex !== -1
                      ? currencyFocusedIndex === index
                      : currency === c.value) && "bg-accent",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCurrency(c.value);
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
      </div>
    </FormModal>
  );
}
