import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateIndicatorProps {
  selectedDate: Date;
  className?: string;
}

export function DateIndicator({ selectedDate, className }: DateIndicatorProps) {
  const label = format(selectedDate, "MMMM yyyy");

  return (
    <div className={cn("text-foreground font-semibold text-lg", className)}>
      {label}
    </div>
  );
}
