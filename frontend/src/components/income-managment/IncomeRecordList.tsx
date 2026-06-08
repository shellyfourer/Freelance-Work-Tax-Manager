import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import type { IncomeRecord } from "@/lib/types/income";
import { formatDate, formatAmount } from "@/lib/utils/income";

interface IncomeRecordListProps {
  records: IncomeRecord[];
  isLoading: boolean;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

function DescriptionCell({ record }: { record: IncomeRecord }) {
  return (
    <span className="block truncate">
      {record.description ?? <span className="italic text-muted-foreground">—</span>}
    </span>
  );
}

function ActionsCell({
  record,
  onEdit,
  onDelete,
}: {
  record: IncomeRecord;
  onEdit: (r: IncomeRecord) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => onEdit(record)}>
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="cursor-pointer border-destructive bg-background"
        onClick={() => onDelete(record.incomeId)}
      >
        Delete
      </Button>
    </div>
  );
}

function getColumns(
  onEdit: (r: IncomeRecord) => void,
  onDelete: (id: number) => void,
): Column<IncomeRecord>[] {
  return [
    {
      key: "incomeDate",
      header: "Date",
      cell: (r) => formatDate(r.incomeDate),
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "client",
      header: "Client",
      cell: (r) => r.incomeSourceName,
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "amount",
      header: "Amount",
      cell: (r) => formatAmount(r.amount),
      headerClassName: "whitespace-nowrap",
    },
    {
      key: "description",
      header: "Description",
      cell: (r) => <DescriptionCell record={r} />,
      headerClassName: "w-full hidden sm:table-cell",
      cellClassName: "max-w-0 hidden sm:table-cell",
    },
    {
      key: "actions",
      header: "",
      cell: (r) => <ActionsCell record={r} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

export function IncomeRecordList({
  records,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: IncomeRecordListProps) {
  const columns = getColumns(onEdit, onDelete);

  return (
    <DataTable
      rows={records}
      columns={columns}
      getRowKey={(r) => r.incomeId}
      isLoading={isLoading}
      onAdd={onAdd}
      emptyMessage="No income records yet."
      emptyButtonLabel="Add your first income"
    />
  );
}
