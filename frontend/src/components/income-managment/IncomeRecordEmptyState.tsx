import { Button } from "@/components/ui/button";

interface IncomeRecordEmptyStateProps {
  onAdd: () => void;
}

export function IncomeRecordEmptyState({ onAdd }: IncomeRecordEmptyStateProps) {
  return (
    <div className="border-[1.5px] border-border border-dashed rounded-card flex flex-col items-center justify-center py-16 gap-4 shadow-elevation-sm">
      <p className="text-muted-foreground text-base m-0 text-center">No income records yet.</p>
      <Button onClick={onAdd} className="h-12 px-6 cursor-pointer">
        Add your first income
      </Button>
    </div>
  );
}
