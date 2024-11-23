"use client";

import { useRouter } from "next/navigation";
import { addMinutes, format, getHours, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { CalendarPostItem } from "@/components/ui/calendar/calendar-post-item";
import { Plus } from "lucide-react";
import { isDateTimePast } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WeekDayTimeItemProps {
  dateSlot: string;
  timeSlot: string;
  minuteSlot: {
    start: number;
    end: number;
  };
  timeZone?: string;
  timeFormat?: number;
  posts: any[];
}

export function WeekDayTimeItem({
  dateSlot,
  timeSlot,
  minuteSlot,
  timeZone = "UTC",
  timeFormat = 12,
  posts,
}: WeekDayTimeItemProps) {
  const router = useRouter();

  const isDisabled = () => {
    const cellDateTimeMinute = addMinutes(
      parseISO(`${dateSlot} ${timeSlot}`),
      minuteSlot.end
    );
    return isDateTimePast(cellDateTimeMinute, timeZone);
  };

  const label = () => {
    const cellDateTimeMinute = addMinutes(
      parseISO(`${dateSlot} ${timeSlot}`),
      minuteSlot.start
    );
    return format(
      cellDateTimeMinute,
      `${timeFormat === 12 ? "h:mm aaa" : "H:mm"}`
    );
  };

  const handleAdd = () => {
    let scheduleAt = `${dateSlot} ${timeSlot}`;
    const now = utcToZonedTime(new Date().toISOString(), timeZone);
    const today = format(now, "yyyy-MM-dd");

    if (`${today} ${getHours(now)}:00` === scheduleAt) {
      scheduleAt = format(now, "yyyy-MM-dd H:mm");
    }

    router.push(`/posts/create?schedule_at=${scheduleAt}`);
  };

  return (
    <div
      className={cn(
        "relative min-h-[50px] group",
        isDisabled() && "bg-[url('/images/calendar-disabled-item.svg')]"
      )}
    >
      {!isDisabled() && (
        <div className="absolute mt-1 right-0 mr-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300">
          <button
            onClick={handleAdd}
            type="button"
            className="flex items-center text-gray-400 hover:text-indigo-500 transition-colors ease-in-out duration-200"
          >
            <span className="mr-1 text-sm">{label()}</span>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {posts.length > 0 && (
        <div className={cn("h-full overflow-hidden", !isDisabled() && "mt-6")}>
          <div className="relative p-0.5 md:p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent h-full">
            <div className="flex flex-wrap gap-1 w-full">
              {posts.map((post) => (
                <CalendarPostItem key={post.id} item={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
