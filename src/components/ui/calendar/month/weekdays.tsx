import { useMemo } from "react";
import { clone } from "lodash";
import { cn } from "@/lib/utils";

interface WeekDay {
  name: string;
  name_short: string;
}

interface WeekdaysProps {
  weekStartsOn?: number;
  className?: string;
}

const WEEKDAYS: WeekDay[] = [
  { name: "Mon", name_short: "M" },
  { name: "Tue", name_short: "T" },
  { name: "Wed", name_short: "W" },
  { name: "Thu", name_short: "T" },
  { name: "Fri", name_short: "F" },
  { name: "Sat", name_short: "S" },
  { name: "Sun", name_short: "S" },
];

export function Weekdays({ weekStartsOn = 0, className }: WeekdaysProps) {
  const items = useMemo(() => {
    const days = clone(WEEKDAYS);
    return days.splice(weekStartsOn ? 0 : 6).concat(days);
  }, [weekStartsOn]);

  return (
    <div className={cn("grid grid-cols-7", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "p-2 border-t border-r border-border text-center font-semibold",
            index === items.length - 1 && "border-r-0"
          )}
        >
          <span className="hidden sm:block">{item.name}</span>
          <span className="block sm:hidden">{item.name_short}</span>
        </div>
      ))}
    </div>
  );
}
