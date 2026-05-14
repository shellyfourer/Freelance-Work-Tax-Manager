import { cn } from "@/lib/utils";

interface IncomeSummaryCardProps {
  label: string;
  value: string;
  prominent?: boolean;
  semiProminent?: boolean;
  empty?: boolean;
}

export function IncomeSummaryCard({
  label,
  value,
  prominent = false,
  semiProminent = false,
  empty = false,
}: IncomeSummaryCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-4 rounded-card border-[1.5px] border-border",
        empty ? "border-dashed" : "border-solid",
        prominent && !empty ? "bg-accent" : semiProminent && !empty ? "bg-muted/70" : "bg-card",
      )}
    >
      <p className="text-muted-foreground text-caption m-0">{label}</p>
      <p
        className={cn(
          "text-h4 m-0",
          prominent && !empty
            ? "text-accent-foreground"
            : empty
              ? "text-muted-foreground italic"
              : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
