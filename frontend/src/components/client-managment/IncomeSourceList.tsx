import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import type { IncomeSource } from "@/lib/types/client";

interface IncomeSourceListProps {
  sources: IncomeSource[];
  isLoading: boolean;
  onEdit: (source: IncomeSource) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export function IncomeSourceList({
  sources,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: IncomeSourceListProps) {
  const columns: Column<IncomeSource>[] = [
    {
      key: "name",
      header: "Client Name",
      cell: (s) => s.name,
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "paymentType",
      header: "Payment Type",
      cell: (s) => (s.paymentType === "HOURLY" ? "Hourly" : "Fixed Project Fee"),
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "hourlyRate",
      header: "Hourly Rate",
      cell: (s) =>
        s.hourlyRate != null ? (
          `€${s.hourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr`
        ) : (
          <span className="italic text-muted-foreground">—</span>
        ),
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "description",
      header: "Description",
      cell: (s) => (
        <span className="block truncate">
          {s.description ?? <span className="italic text-muted-foreground">—</span>}
        </span>
      ),
      headerClassName: "w-full hidden sm:table-cell",
      cellClassName: "max-w-0 hidden sm:table-cell",
    },
    {
      key: "actions",
      header: "",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => onEdit(s)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer border-destructive bg-background"
            onClick={() => onDelete(s.sourceId)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={sources}
      columns={columns}
      getRowKey={(s) => s.sourceId}
      isLoading={isLoading}
      onAdd={onAdd}
      emptyMessage="No clients yet. Add your first client to start tracking income."
      emptyButtonLabel="Add your first client"
    />
  );
}