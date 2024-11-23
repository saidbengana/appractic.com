"use client";

import { addWeeks, parseISO, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  currentDate: string | Date;
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
}

export function DateSelector({
  currentDate,
  selectedDate,
  onDateSelected,
}: DateSelectorProps) {
  const handlePrevious = () => {
    const newSelectedDate = subWeeks(selectedDate, 1);
    onDateSelected(newSelectedDate);
  };

  const handleCurrent = () => {
    const newSelectedDate =
      typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
    onDateSelected(newSelectedDate);
  };

  const handleNext = () => {
    const newSelectedDate = addWeeks(selectedDate, 1);
    onDateSelected(newSelectedDate);
  };

  return (
    <div className="flex items-center">
      <Button
        variant="secondary"
        onClick={handleCurrent}
        className="mr-2"
      >
        Today
      </Button>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
