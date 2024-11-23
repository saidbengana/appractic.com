"use client";

import { addDays, addMinutes, format, parseISO, startOfWeek } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { useCallback, useMemo, useState } from "react";
import { range, throttle } from "lodash";
import { convertTime24to12 } from "@/lib/utils";
import { DateIndicator } from "@/components/ui/calendar/week/date-indicator";
import { DateSelector } from "@/components/ui/calendar/week/date-selector";
import { Weekdays } from "@/components/ui/calendar/week/weekdays";
import { WeekDayTimeItem } from "@/components/ui/calendar/week/week-day-time-item";
import { cn } from "@/lib/utils";

interface CalendarWeekProps {
  timeZone?: string;
  initialDate?: string | Date;
  weekStartsOn?: number;
  timeFormat?: number;
  posts?: any[];
  headerSlot?: React.ReactNode;
  onDateSelected?: (date: Date) => void;
}

export function CalendarWeek({
  timeZone = "UTC",
  initialDate = format(
    utcToZonedTime(new Date().toISOString(), "UTC"),
    "yyyy-MM-dd"
  ),
  weekStartsOn = 0,
  timeFormat = 12,
  posts = [],
  headerSlot,
  onDateSelected,
}: CalendarWeekProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
  const [scrolled, setScrolled] = useState(false);

  const today = useMemo(
    () =>
      format(utcToZonedTime(new Date().toISOString(), timeZone), "yyyy-MM-dd"),
    [timeZone]
  );

  const start = useMemo(
    () =>
      startOfWeek(selectedDate, {
        weekStartsOn,
      }),
    [selectedDate, weekStartsOn]
  );

  const weekDays = useMemo(
    () =>
      range(7).map((item) => {
        const date = item === 0 ? start : addDays(start, item);
        return format(date, "yyyy-MM-dd");
      }),
    [start]
  );

  const dayTimes = useMemo(
    () =>
      range(24).map((i) => {
        const value = `${i}:00`.padStart(5, "0");
        return {
          12: convertTime24to12(value, "h aaa"),
          24: value,
        };
      }),
    []
  );

  const minuteSlots = [
    {
      start: 0,
      end: 59,
    },
  ];

  const getPosts = useCallback(
    (date: string, time: string, minuteSlot: { start: number; end: number }) => {
      return posts.filter((post) => {
        const startTime = format(
          addMinutes(parseISO(`${date} ${time}`), minuteSlot.start),
          "kk:mm"
        );
        const endTime = format(
          addMinutes(parseISO(`${date} ${time}`), minuteSlot.end),
          "kk:mm"
        );

        return (
          date === post.scheduled_at.date &&
          post.scheduled_at.time >= startTime &&
          post.scheduled_at.time <= endTime
        );
      });
    },
    [posts]
  );

  const handleDateSelect = (value: Date) => {
    setSelectedDate(value);
    onDateSelected?.(value);
  };

  const handleScroll = throttle((event: React.UIEvent<HTMLDivElement>) => {
    setScrolled((event.target as HTMLDivElement).scrollTop > 0);
  }, 100);

  return (
    <div className="bg-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 px-6">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <DateSelector
            currentDate={today}
            selectedDate={selectedDate}
            onDateSelected={handleDateSelect}
          />
          <DateIndicator selectedDate={selectedDate} weekStartsOn={weekStartsOn} />
        </div>

        {headerSlot}
      </div>

      <div
        onScroll={handleScroll}
        className="calendar-week-height-sm md:calendar-week-height-md xl:calendar-week-height overflow-y-auto"
      >
        <Weekdays
          timeZone={timeZone}
          weekStartsOn={weekStartsOn}
          selectedDate={selectedDate}
          scrolled={scrolled}
        />

        <div className="w-full grid grid-cols-week-time-sm md:grid-cols-week-time">
          {dayTimes.map((time) =>
            minuteSlots.map((minuteSlot, minuteSlotIndex) => (
              <>
                <div className="text-center text-gray-400 text-sm font-semibold">
                  {minuteSlotIndex === 0 ? time[timeFormat] : ""}
                </div>

                {weekDays.map((weekday, indexDay) => (
                  <div
                    key={indexDay}
                    className={cn(
                      "grid grid-cols-1 border-l border-t border-gray-200 text-center bg-white",
                      minuteSlotIndex !== 0 && "!border-t-gray-100"
                    )}
                  >
                    <WeekDayTimeItem
                      dateSlot={weekday}
                      timeSlot={time[24]}
                      minuteSlot={minuteSlot}
                      timeZone={timeZone}
                      timeFormat={timeFormat}
                      posts={getPosts(weekday, time[24], minuteSlot)}
                    />
                  </div>
                ))}
              </>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
