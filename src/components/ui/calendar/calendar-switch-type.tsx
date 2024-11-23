import { useContext } from "react";
import { ChevronDownIcon, CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarContext } from "@/contexts/calendar-context";

type CalendarType = "month" | "week";

const typeNames: Record<CalendarType, string> = {
  month: "Month",
  week: "Week",
};

export function CalendarSwitchType() {
  const { calendarType, setCalendarType } = useContext(CalendarContext);

  const handleSelect = (type: CalendarType) => {
    setCalendarType(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="w-32">
          <span className="inline-block mr-2">{typeNames[calendarType]}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => handleSelect("month")}>
          <CalendarIcon className="h-5 w-5 mr-2" />
          Month
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSelect("week")}>
          <CalendarIcon className="h-5 w-5 mr-2" />
          Week
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
