import { cn } from "@/lib/utils";
import type { IncomeRecord } from "@/lib/types/income";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncomeRecordEmptyState } from "@/components/income-managment/IncomeRecordEmptyState";

const tableHeadClass = "px-4 py-3 text-caption text-muted-foreground font-normal";
const tableCellClass = "px-4 py-3 text-base text-foreground";

interface IncomeRecordListProps {
  records: IncomeRecord[];
  isLoading: boolean;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number): string {
  return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function IncomeRecordList({
  records,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: IncomeRecordListProps) {
  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <p className="text-muted-foreground italic text-base">Loading records…</p>
      </div>
    );
  }

  if (records.length === 0) {
    return <IncomeRecordEmptyState onAdd={onAdd} />;
  }

  return (
    <div className="border-[1.5px] border-border shadow-elevation-sm rounded-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-background border-b-[1.5px] border-border">
            <TableHead className={cn(tableHeadClass, "whitespace-nowrap")}>Date</TableHead>
            <TableHead className={cn(tableHeadClass, "whitespace-nowrap")}>Amount</TableHead>
            <TableHead className={cn(tableHeadClass, "w-full hidden sm:table-cell")}>
              Description
            </TableHead>
            <TableHead className={cn(tableHeadClass, "whitespace-nowrap")}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.incomeId}>
              <TableCell className={tableCellClass}>{formatDate(record.incomeDate)}</TableCell>
              <TableCell className={tableCellClass}>
                {formatAmount(record.amount)}
              </TableCell>
              <TableCell className={cn(tableCellClass, "max-w-0 hidden sm:table-cell")}>
                <span className="block truncate">
                  {record.description ?? <span className="italic text-muted-foreground">—</span>}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => onEdit(record)}
                  >
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
