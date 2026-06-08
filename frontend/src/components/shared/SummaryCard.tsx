import { cn } from "@/lib/utils";

function getBgClass(prominent: boolean, semiProminent: boolean, empty: boolean): string {
  if (prominent && !empty) return "bg-accent border-accent";
  if (semiProminent && !empty) return "bg-muted/70 border-muted/70";
  return "bg-card";
}

function getTextClass(prominent: boolean, empty: boolean): string {
  if (prominent && !empty) return "text-accent-foreground";
  if (empty) return "text-muted-foreground italic";
  return "text-foreground";
}

interface SummaryCardProps {
  label: string;
  value: string;
  prominent?: boolean;
  semiProminent?: boolean;
  empty?: boolean;
}

export function SummaryCard({
  label,
  value,
  prominent = false,
  semiProminent = false,
  empty = false,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-card border-[1.5px] border-border shadow-elevation-sm",
        empty ? "border-dashed" : "border-solid",
        getBgClass(prominent, semiProminent, empty),
      )}
    >
      <p className="text-primary text-caption m-0">{label}</p>
      <p className={cn("text-h4 m-0", getTextClass(prominent, empty))}>{value}</p>
    </div>
  );
}
