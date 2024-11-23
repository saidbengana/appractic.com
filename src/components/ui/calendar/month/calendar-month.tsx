import { useState, useMemo } from "react";
import {
  format,
  getDaysInMonth,
  subMonths,
  subDays,
  getDate,
  getYear,
  getMonth,
  lastDayOfMonth,
  addMonths,
  getDay,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { cn } from "@/lib/utils";
import { DateIndicator } from "./date-indicator";
import { DateSelector } from "./date-selector";
import { Weekdays } from "./weekdays";
import { MonthDayItem } from "./month-day-item";
import { isDatePast } from "@/lib/utils";

interface Post {
  id: string;
  scheduled_at: {
    date: string;
    time: string;
  };
  [key: string]: any;
}

interface CalendarMonthProps {
  timeZone?: string;
  initialDate?: string | Date;
  weekStartsOn?: number;
  posts?: Post[];
  className?: string;
  headerSlot?: React.ReactNode;
  onDateSelected?: (date: Date) => void;
}

export function CalendarMonth({
  timeZone = "UTC",
  initialDate = format(
    utcToZonedTime(new Date().toISOString(), timeZone),
    "yyyy-MM-dd"
  ),
  weekStartsOn = 0,
  posts = [],
  className,
  headerSlot,
  onDateSelected,
}: CalendarMonthProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date(`${initialDate}T00:00:00`)
  );

  const today = useMemo(
    () =>
      format(utcToZonedTime(new Date().toISOString(), timeZone), "yyyy-MM-dd"),
    [timeZone]
  );

  const month = useMemo(
    () => (getMonth(selectedDate) + 1).toString().padStart(2, "0"),
    [selectedDate]
  );

  const year = useMemo(() => getYear(selectedDate), [selectedDate]);

  const numberOfDaysInMonth = useMemo(
    () => getDaysInMonth(selectedDate),
    [selectedDate]
  );

  const getWeekday = (date: string | Date) => {
    return getDay(
      typeof date === "string" ? new Date(`${date}T00:00:00`) : date
    );
  };

  const getDayPosts = (date: Date) => {
    return posts.filter(
      (post) => format(date, "yyyy-MM-dd") === post.scheduled_at.date
    );
  };

  const previousMonthDays = useMemo(() => {
    const currentMonthDays = [...Array(numberOfDaysInMonth)].map(
      (_, index) => {
        const date = new Date(
          `${year}-${month}-${(index + 1).toString().padStart(2, "0")}T00:00:00`
        );
        return {
          date: format(date, "yyyy-MM-dd"),
          isDisabled: isDatePast(date, timeZone),
          posts: getDayPosts(date),
        };
      }
    );

    const firstDayOfTheMonthWeekday = getWeekday(currentMonthDays[0].date);

    const visibleNumberOfDaysFromPreviousMonth = firstDayOfTheMonthWeekday
      ? firstDayOfTheMonthWeekday - weekStartsOn
      : weekStartsOn
      ? 6
      : 0;

    const previousMonthLastMondayDayOfMonth = getDate(
      subDays(
        new Date(`${currentMonthDays[0].date}T00:00:00`),
        visibleNumberOfDaysFromPreviousMonth
      )
    );

    const previousMonth = subMonths(selectedDate, 1);

    return [...Array(visibleNumberOfDaysFromPreviousMonth)].map((_, index) => {
      const date = new Date(
        `${getYear(previousMonth)}-${(getMonth(previousMonth) + 1)
          .toString()
          .padStart(2, "0")}-${(previousMonthLastMondayDayOfMonth + index)
          .toString()
          .padStart(2, "0")}T00:00:00`
      );

      return {
        date: format(date, "yyyy-MM-dd"),
        isDisabled: isDatePast(date, timeZone),
        posts: getDayPosts(date),
      };
    });
  }, [selectedDate, weekStartsOn, timeZone, month, year, numberOfDaysInMonth]);

  const currentMonthDays = useMemo(
    () =>
      [...Array(numberOfDaysInMonth)].map((_, index) => {
        const date = new Date(
          `${year}-${month}-${(index + 1).toString().padStart(2, "0")}T00:00:00`
        );

        return {
          date: format(date, "yyyy-MM-dd"),
          isDisabled: isDatePast(date, timeZone),
          posts: getDayPosts(date),
        };
      }),
    [selectedDate, timeZone, month, year, numberOfDaysInMonth]
  );

  const nextMonthDays = useMemo(() => {
    const lastDayOfTheMonthWeekday = getWeekday(
      lastDayOfMonth(selectedDate)
    );

    const visibleNumberOfDaysFromNextMonth = lastDayOfTheMonthWeekday
      ? (weekStartsOn ? 7 : 6) - lastDayOfTheMonthWeekday
      : lastDayOfTheMonthWeekday;

    const nextMonth = addMonths(selectedDate, 1);

    return [...Array(visibleNumberOfDaysFromNextMonth)].map((_, index) => {
      const date = new Date(
        `${getYear(nextMonth)}-${(getMonth(nextMonth) + 1)
          .toString()
          .padStart(2, "0")}-${(index + 1).toString().padStart(2, "0")}T00:00:00`
      );

      return {
        date: format(date, "yyyy-MM-dd"),
        isDisabled: false,
        posts: getDayPosts(date),
      };
    });
  }, [selectedDate, weekStartsOn]);

  const days = useMemo(
    () => [...previousMonthDays, ...currentMonthDays, ...nextMonthDays],
    [previousMonthDays, currentMonthDays, nextMonthDays]
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelected?.(date);
  };

  return (
    <div className={cn("bg-white", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 px-4">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <DateSelector
            currentDate={today}
            selectedDate={selectedDate}
            onDateSelected={handleDateSelect}
          />
          <DateIndicator selectedDate={selectedDate} />
        </div>

        {headerSlot}
      </div>

      <Weekdays weekStartsOn={weekStartsOn} />

      <div className="h-[calc(100vh-16rem)] grid grid-cols-7 relative border-t border-border">
        {days.map((day) => (
          <MonthDayItem
            key={day.date}
            day={day}
            isToday={day.date === today}
            timeZone={timeZone}
          />
        ))}
      </div>
    </div>
  );
}
