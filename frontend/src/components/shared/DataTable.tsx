import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableEmptyState } from "@/components/shared/DataTableEmptyState";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string | number;
  isLoading: boolean;
  onAdd: () => void;
  emptyMessage: string;
  emptyButtonLabel: string;
}

const headClass = "px-4 py-3 text-caption text-muted-foreground font-normal";
const cellClass = "px-4 py-3 text-base text-foreground";

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  isLoading,
  onAdd,
  emptyMessage,
  emptyButtonLabel,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <p className="text-muted-foreground italic text-base">Loading…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <DataTableEmptyState message={emptyMessage} buttonLabel={emptyButtonLabel} onAdd={onAdd} />
    );
  }

  return (
    <div className="border-[1.5px] border-border shadow-elevation-sm rounded-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-background border-b-[1.5px] border-border">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn(headClass, col.headerClassName)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={cn(cellClass, col.cellClassName)}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
