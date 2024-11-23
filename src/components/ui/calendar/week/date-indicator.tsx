"use client";

import { format, startOfWeek, endOfWeek } from "date-fns";
import { useMemo } from "react";

interface DateIndicatorProps {
  selectedDate: Date;
  weekStartsOn?: number;
}

export function DateIndicator({
  selectedDate,
  weekStartsOn = 0,
}: DateIndicatorProps) {
  const label = useMemo(() => {
    const start = startOfWeek(selectedDate, {
      weekStartsOn,
    });

    const end = endOfWeek(selectedDate, {
      weekStartsOn,
    });

    return `${format(start, "MMM do")} - ${format(end, "MMM do")}`;
  }, [selectedDate, weekStartsOn]);

  return <div className="text-gray-700 font-semibold text-lg">{label}</div>;
}
