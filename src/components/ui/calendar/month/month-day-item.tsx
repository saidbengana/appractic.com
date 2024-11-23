import { useMemo } from "react";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { CalendarPostItem } from "../calendar-post-item";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  [key: string]: any; // Add specific post properties as needed
}

interface Day {
  date: string;
  isDisabled: boolean;
  posts: Post[];
}

interface MonthDayItemProps {
  day: Day;
  isToday?: boolean;
  timeZone?: string;
  className?: string;
}

export function MonthDayItem({
  day,
  isToday = false,
  timeZone = "UTC",
  className,
}: MonthDayItemProps) {
  const router = useRouter();

  const label = useMemo(() => {
    return format(new Date(`${day.date}T00:00:00`), "d");
  }, [day.date]);

  const style = useMemo(() => {
    if (!day.isDisabled) {
      return {};
    }

    return {
      backgroundImage: "url('/images/calendar-disabled-item.svg')",
    };
  }, [day.isDisabled]);

  const handleAdd = () => {
    const now = utcToZonedTime(new Date().toISOString(), timeZone);
    const scheduleAt = `${day.date} ${format(now, "HH:mm")}`;
    router.push(`/posts/create?schedule_at=${scheduleAt}`);
  };

  return (
    <div
      className={cn(
        "relative min-h-[100px] overflow-hidden bg-white border-r border-b border-border group",
        className
      )}
      style={style}
    >
      <div className="absolute w-full top-0 left-0 mt-1 text-center">
        <span
          className={cn(
            "w-7 h-7 inline-flex items-center justify-center p-1 mr-1 rounded-full",
            isToday && "bg-primary text-primary-foreground",
            day.isDisabled && "text-muted-foreground",
            !isToday && !day.isDisabled && "text-foreground"
          )}
        >
          {label}
        </span>
      </div>

      {!day.isDisabled && (
        <div className="absolute mt-1 right-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleAdd}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Add post"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {day.posts.length > 0 && (
        <div className="mt-8 pb-8 h-full overflow-hidden">
          <div className="relative p-0.5 md:p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-border h-full">
            <div className="flex flex-col gap-1 w-full">
              {day.posts.map((post) => (
                <CalendarPostItem key={post.id} item={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
