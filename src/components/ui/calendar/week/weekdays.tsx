"use client";

import { useMemo } from "react";
import { addDays, getDate, startOfWeek } from "date-fns";
import { clone } from "lodash";
import { utcToZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";

interface WeekdaysProps {
  timeZone?: string;
  weekStartsOn?: number;
  selectedDate: Date;
  scrolled?: boolean;
}

const WEEKDAYS = [
  {
    name: "Mon",
    name_short: "M",
  },
  {
    name: "Tue",
    name_short: "T",
  },
  {
    name: "Wed",
    name_short: "W",
  },
  {
    name: "Thu",
    name_short: "T",
  },
  {
    name: "Fri",
    name_short: "F",
  },
  {
    name: "Sat",
    name_short: "S",
  },
  {
    name: "Sun",
    name_short: "S",
  },
];

export function Weekdays({
  timeZone = "UTC",
  weekStartsOn = 0,
  selectedDate,
  scrolled = false,
}: WeekdaysProps) {
  const start = useMemo(
    () =>
      startOfWeek(selectedDate, {
        weekStartsOn,
      }),
    [selectedDate, weekStartsOn]
  );

  const today = useMemo(
    () => getDate(utcToZonedTime(new Date().toISOString(), timeZone)),
    [timeZone]
  );

  const items = useMemo(() => {
    const days = clone(WEEKDAYS);
    const reorderedDays = days.splice(weekStartsOn ? 0 : 6).concat(days);

    return reorderedDays.map((item, index) => {
      const date = index === 0 ? start : addDays(start, index);
      const monthDay = getDate(date);

      return {
        ...item,
        date: monthDay,
        isToday: today === monthDay,
      };
    });
  }, [start, today, weekStartsOn]);

  return (
    <div className="flex flex-row sticky top-0 bg-white z-10">
      <div className="w-full grid grid-cols-week-time-sm md:grid-cols-week-time">
        <div></div>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "p-2 border-t border-b border-l border-gray-200 text-center font-semibold",
              item.isToday && "text-indigo-500",
              scrolled ? "border-b-gray-200" : "border-b-white"
            )}
          >
            <div className="text-base md:text-xl">{item.date}</div>

            <span className={cn(!item.isToday && "text-gray-500")}>
              <span className="hidden md:block">{item.name}</span>
              <span className="block md:hidden">{item.name_short}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
