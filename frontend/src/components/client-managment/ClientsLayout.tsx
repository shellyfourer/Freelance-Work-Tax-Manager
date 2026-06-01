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
import { IncomeSourceList } from "@/components/client-managment/IncomeSourceList";
import { IncomeSourceForm } from "@/components/client-managment/IncomeSourceForm";
import {
  createIncomeSource,
  getIncomeSourcesByUser,
  updateIncomeSource,
  deleteIncomeSource,
} from "@/lib/api/client";
import type { IncomeSource, IncomeSourceRequest } from "@/lib/types/client";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { calculateClientSummary, formatRate } from "@/lib/utils/clients";

const DEFAULT_USER_ID = 1;

export function ClientsLayout() {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    getIncomeSourcesByUser(DEFAULT_USER_ID)
      .then(setSources)
      .catch(() => setLoadError("Failed to load clients. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const { totalClients, hourlyClients, fixedClients, averageHourlyRate, highestHourlyRate } =
    calculateClientSummary(sources);
  const hasClients = totalClients > 0;

  const openAdd = () => {
    setEditingSource(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (source: IncomeSource) => {
    setEditingSource(source);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSource(null);
    setFormError(null);
  };

  const handleSave = async (data: IncomeSourceRequest) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingSource) {
        const updated = await updateIncomeSource(editingSource.sourceId, data);
        setSources((prev) =>
          prev.map((s) => (s.sourceId === editingSource.sourceId ? updated : s)),
        );
        toast.success("Client updated.");
      } else {
        const created = await createIncomeSource(data);
        setSources((prev) => [...prev, created]);
        toast.success("Client created.");
      }
      closeForm();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (id: number) => setDeleteTargetId(id);
  const cancelDelete = () => setDeleteTargetId(null);
  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await deleteIncomeSource(id);
      setSources((prev) => prev.filter((s) => s.sourceId !== id));
      toast.success("Client deleted.");
    } catch {
      toast.error("Failed to delete client. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-10">
      {/* Delete confirmation */}
      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent className="shadow-elevation-sm border-[1.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
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

      {/* Add/Edit form */}
      <IncomeSourceForm
        open={showForm}
        editingSource={editingSource}
        isSubmitting={isSubmitting}
        apiError={formError}
        onSave={handleSave}
        onClose={closeForm}
      />

      {/* Page content */}
      <div className="w-full max-w-300 mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2 text-foreground m-0">Clients</h2>
          </div>
          <Button onClick={openAdd} className="h-11 px-5 cursor-pointer">
            + Add Client
          </Button>
        </div>

        {loadError && (
          <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg border-destructive mb-6">
            <p className="text-caption text-destructive">⚠ {loadError}</p>
          </div>
        )}

        {/* Summary */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-h4 text-foreground m-0">Summary</p>
            <span className="text-muted-foreground italic text-caption">Tracked client data</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard
              label="Total Clients"
              value={hasClients ? String(totalClients) : "—"}
              empty={!hasClients}
            />
            <SummaryCard
              label="Average Hourly Rate"
              value={averageHourlyRate != null ? formatRate(averageHourlyRate) : "—"}
              empty={averageHourlyRate == null}
            />
          </div>

          {/* Client Insights */}
          <div className="flex items-baseline gap-2 mt-6 mb-3">
            <p className="text-h4 text-foreground m-0">Client Insights</p>
            <span className="text-muted-foreground italic text-caption">Portfolio overview</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Hourly Clients"
              value={hasClients ? String(hourlyClients) : "—"}
              empty={!hasClients}
            />
            <SummaryCard
              label="Fixed-Price Clients"
              value={hasClients ? String(fixedClients) : "—"}
              empty={!hasClients}
            />
            <SummaryCard
              label="Highest Hourly Rate"
              value={highestHourlyRate != null ? formatRate(highestHourlyRate) : "—"}
              prominent={highestHourlyRate != null}
              empty={highestHourlyRate == null}
            />
          </div>
          <p className="text-muted-foreground italic text-caption mt-2.5">
            Client insights are based on your current client list. Hourly rate stats only reflect
            clients with a rate set.
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 border-b-[1.5px] border-border opacity-30" />

        {/* Clients table */}
        <div>
          <p className="text-h4 text-foreground mb-4">Clients</p>
          <IncomeSourceList
            sources={sources}
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
