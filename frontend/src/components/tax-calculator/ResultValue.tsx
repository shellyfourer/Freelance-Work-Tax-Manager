import { cn } from "@/lib/utils";

interface ResultValueProps {
  value: string;
  filled: boolean;
  prominent: boolean;
}

export function ResultValue({ value, filled, prominent }: ResultValueProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center px-4 py-2 min-w-30 border-[1.5px] transition-all duration-200",
        filled ? "border-solid border-border" : "border-dashed border-muted",
        filled && prominent && "bg-accent text-accent-foreground",
        filled && !prominent && "bg-card text-foreground",
        !filled && "bg-transparent text-muted-foreground",
      )}
      style={{ borderRadius: "var(--radius-button)" }}
    >
      <span style={{ fontSize: "var(--text-h4)" }}>{value}</span>
    </div>
  );
}
