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

function HourlyRateCell({ source }: { source: IncomeSource }) {
  if (source.hourlyRate == null) return <span className="italic text-muted-foreground">—</span>;
  return (
    <>{`€${source.hourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr`}</>
  );
}

function DescriptionCell({ source }: { source: IncomeSource }) {
  return (
    <span className="block truncate">
      {source.description ?? <span className="italic text-muted-foreground">—</span>}
    </span>
  );
}

function ActionsCell({
  source,
  onEdit,
  onDelete,
}: {
  source: IncomeSource;
  onEdit: (s: IncomeSource) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => onEdit(source)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="cursor-pointer border-destructive bg-background"
        onClick={() => onDelete(source.sourceId)}
      >
        Delete
      </Button>
    </div>
  );
}

function getColumns(
  onEdit: (s: IncomeSource) => void,
  onDelete: (id: number) => void,
): Column<IncomeSource>[] {
  return [
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
      cell: (s) => <HourlyRateCell source={s} />,
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "description",
      header: "Description",
      cell: (s) => <DescriptionCell source={s} />,
      headerClassName: "w-full hidden sm:table-cell",
      cellClassName: "max-w-0 hidden sm:table-cell",
    },
    {
      key: "actions",
      header: "",
      cell: (s) => <ActionsCell source={s} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

export function IncomeSourceList({
  sources,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: IncomeSourceListProps) {
  const columns = getColumns(onEdit, onDelete);

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
