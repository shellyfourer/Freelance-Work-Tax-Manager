"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { SummaryCard } from "@/components/shared/SummaryCard";
import { IncomeRecordList } from "@/components/income-managment/IncomeRecordList";
import { IncomeRecordForm } from "@/components/income-managment/IncomeRecordForm";
import {
  createIncomeRecord,
  getIncomeRecordsByUser,
  updateIncomeRecord,
  deleteIncomeRecord,
} from "@/lib/api/income";
import type { IncomeRecord, IncomeRecordRequest } from "@/lib/types/income";
import { calculateTax } from "@/lib/api/tax";
import type { TaxCalculatorResult } from "@/lib/types/tax";
import { calculateIncomeSummary } from "@/lib/utils/income";
import { getIncomeSourcesByUser } from "@/lib/api/client";
import type { IncomeSource } from "@/lib/types/client";

const DEFAULT_USER_ID = 1;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMoney(amount: number): string {
  return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function IncomeLayout() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [taxResult, setTaxResult] = useState<TaxCalculatorResult | null>(null);

  useEffect(() => {
    Promise.all([getIncomeRecordsByUser(DEFAULT_USER_ID), getIncomeSourcesByUser(DEFAULT_USER_ID)])
      .then(([records, sources]) => {
        setRecords(records);
        setIncomeSources(sources);
      })
      .catch(() => setLoadError("Failed to load income records. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const elapsedMonths = Math.max(1, now.getMonth() + 1);
  const { totalIncome, monthlyAverage, projectedYearEnd } = calculateIncomeSummary(
    records,
    elapsedMonths,
  );
  const hasRecords = records.length > 0;
  const elapsedRangeLabel = elapsedMonths === 1 ? "Jan" : `Jan–${MONTH_SHORT[elapsedMonths - 1]}`;

  useEffect(() => {
    if (!hasRecords) {
      setTaxResult(null);
      return;
    }
    calculateTax({ incomeAmount: projectedYearEnd, period: "annual", country: "LT" })
      .then(setTaxResult)
      .catch(() => setTaxResult(null));
  }, [projectedYearEnd, hasRecords]);

  // Form handlers
  const openAdd = () => {
    setEditingRecord(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (record: IncomeRecord) => {
    setEditingRecord(record);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    setFormError(null);
  };

  const handleSave = async (data: IncomeRecordRequest) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingRecord) {
        const updated = await updateIncomeRecord(editingRecord.incomeId, data);
        setRecords((prev) =>
          prev.map((r) => (r.incomeId === editingRecord.incomeId ? updated : r)),
        );
        toast.success("Income record updated.");
      } else {
        const created = await createIncomeRecord(data);
        setRecords((prev) => [...prev, created]);
        toast.success("Income record created.");
      }
      closeForm();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const requestDelete = (id: number) => setDeleteTargetId(id);
  const cancelDelete = () => setDeleteTargetId(null);
  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await deleteIncomeRecord(id);
      setRecords((prev) => prev.filter((r) => r.incomeId !== id));
      toast.success("Income record deleted.");
    } catch {
      toast.error("Failed to delete income record. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-10">
      {/* Delete confirmation modal */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent className="shadow-elevation-sm border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete Income Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t-0 bg-transparent mx-0 mb-0 px-0 pb-0 pt-0">
            <AlertDialogCancel className="cursor-pointer" onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              className="cursor-pointer border-destructive text-destructive hover:bg-destructive/10! hover:text-destructive!"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Add/Edit form modal */}
      <IncomeRecordForm
        open={showForm}
        editingRecord={editingRecord}
        incomeSources={incomeSources}
        isSubmitting={isSubmitting}
        apiError={formError}
        onSave={handleSave}
        onClose={closeForm}
      />

      {/* Page content */}
      <div className="w-full max-w-300 mx-auto px-4 md:px-8">
        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2 text-foreground m-0">Income Tracking</h2>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-caption">
                {currentYear} Income Overview
              </span>
              <span className="text-muted-foreground text-caption">·</span>
              <span className="text-muted-foreground text-caption">Lithuania · EUR</span>
            </div>
          </div>
          <Button onClick={openAdd} className="h-11 px-5 cursor-pointer">
            + Add Income
          </Button>
        </div>

        {/* Load error */}
        {loadError && (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-destructive">
            <p className="text-caption text-destructive">⚠ {loadError}</p>
          </div>
        )}

        {/* Summary + Projections */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-h4 text-foreground m-0">Summary</p>
            <span className="text-muted-foreground italic text-caption">Tracked factual data</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard
              label="Total Income So Far"
              value={hasRecords ? formatMoney(totalIncome) : "—"}
              empty={!hasRecords}
            />
            <SummaryCard
              label="Average Monthly Income"
              value={hasRecords ? formatMoney(monthlyAverage) : "—"}
              empty={!hasRecords}
            />
          </div>

          <div className="flex items-baseline gap-2 mt-6 mb-3">
            <p className="text-h4 text-foreground m-0">Projections</p>
            <span className="text-muted-foreground italic text-caption">
              ~ Estimated · not for tax filing
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Estimated Year-End Income"
              value={hasRecords ? formatMoney(projectedYearEnd) : "—"}
              empty={!hasRecords}
            />
            <SummaryCard
              label="Est. Tax to Set Aside"
              value={taxResult ? formatMoney(taxResult.totalTax) : "—"}
              empty={!taxResult}
            />
            <SummaryCard
              label="Est. Net Income"
              value={taxResult ? formatMoney(taxResult.netIncome) : "—"}
              prominent={true}
              empty={!taxResult}
            />
          </div>
          <p className="text-muted-foreground italic text-caption mt-2.5">
            These are estimates based on income recorded so far this year. The monthly average is
            calculated across all elapsed months ({elapsedRangeLabel}, {elapsedMonths} month
            {elapsedMonths !== 1 ? "s" : ""}), then extrapolated through December. Figures assume
            current trends continue — for planning purposes only, not for tax filing.
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 border-b-[1.5px] border-border opacity-30" />

        {/* Income records */}
        <div>
          <p className="text-h4 text-foreground mb-4">Income Records</p>
          <IncomeRecordList
            records={records}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={requestDelete}
            onAdd={openAdd}
          />
        </div>
      </div>
    </div>
  );
}
