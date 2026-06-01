import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  buttonLabel: string;
  onAdd: () => void;
}

export function DataTableEmptyState({ message, buttonLabel, onAdd }: EmptyStateProps) {
  return (
    <div className="border-[1.5px] border-border border-dashed rounded-card flex flex-col items-center justify-center py-16 gap-4 shadow-elevation-sm">
      <p className="text-muted-foreground text-base m-0 text-center">{message}</p>
      <Button onClick={onAdd} className="h-12 px-6 cursor-pointer">
        {buttonLabel}
      </Button>
    </div>
  );
}
