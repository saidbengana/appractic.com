import { startOfMonth, addMonths, parseISO, subMonths } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  currentDate: string | Date;
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
  className?: string;
}

export function DateSelector({
  currentDate,
  selectedDate,
  onDateSelected,
  className,
}: DateSelectorProps) {
  const handlePrevious = () => {
    const newSelectedDate = startOfMonth(subMonths(selectedDate, 1));
    onDateSelected(newSelectedDate);
  };

  const handleCurrent = () => {
    const newSelectedDate =
      typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
    onDateSelected(newSelectedDate);
  };

  const handleNext = () => {
    const newSelectedDate = startOfMonth(addMonths(selectedDate, 1));
    onDateSelected(newSelectedDate);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="secondary" onClick={handleCurrent}>
        Today
      </Button>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
