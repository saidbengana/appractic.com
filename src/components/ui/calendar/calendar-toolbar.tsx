import { useContext } from "react";
import { CalendarSwitchType } from "./calendar-switch-type";
import { PostsFilter } from "@/components/ui/post/posts-filter";
import { CalendarFilterContext } from "@/contexts/calendar-filter-context";

export function CalendarToolbar() {
  const { calendarFilter, setCalendarFilter } = useContext(CalendarFilterContext);

  return (
    <div className="flex items-center space-x-4">
      <CalendarSwitchType />
      <PostsFilter value={calendarFilter} onChange={setCalendarFilter} />
    </div>
  );
}
