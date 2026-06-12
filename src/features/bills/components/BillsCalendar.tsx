import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { Button, Card, Text, cn } from "../../../shared/ui";
import type { BillCalendarOccurrence } from "../types/bill.types";
import { BILL_STATUS_DOT_STYLES, getDateKey } from "../utils/bill.formatters";

type BillsCalendarProps = {
  month: Date;
  selectedDate: Date;
  occurrences: BillCalendarOccurrence[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
};

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function BillsCalendar({
  month,
  selectedDate,
  occurrences,
  isLoading = false,
  isError = false,
  errorMessage,
  onMonthChange,
  onSelectDate,
}: BillsCalendarProps) {
  const occurrencesByDate = useMemo(() => {
    return occurrences.reduce<Record<string, BillCalendarOccurrence[]>>((acc, occurrence) => {
      const key = getDateKey(occurrence.dueDate);
      if (!key) return acc;
      acc[key] = [...(acc[key] ?? []), occurrence];
      return acc;
    }, {});
  }, [occurrences]);

  const DayButton = (props: DayButtonProps) => {
    const dateKey = getDateKey(props.day.date);
    const dayOccurrences = occurrencesByDate[dateKey] ?? [];

    return (
      <button {...props} className={cn(props.className, "relative flex flex-col gap-1")}>
        <span>{props.children}</span>
        {dayOccurrences.length > 0 && (
          <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            {dayOccurrences.slice(0, 4).map((occurrence, index) => (
              <span
                key={`${occurrence.occurrenceId}-${index}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  BILL_STATUS_DOT_STYLES[occurrence.status] ?? "bg-gray-400",
                )}
              />
            ))}
          </span>
        )}
      </button>
    );
  };

  return (
    <Card padding="md" className="h-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text as="h2" variant="subtitle" weight="bold" className="text-lg text-black">
          Upcoming Bills Calendar
        </Text>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            shape="circle"
            onClick={() => onMonthChange(addMonths(month, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </Button>
          <span className="min-w-32 text-center text-sm font-bold text-text-primary">
            {formatMonthTitle(month)}
          </span>
          <Button
            type="button"
            variant="secondary"
            shape="circle"
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </Button>
        </div>
      </div>

      {isLoading && <div className="h-72 animate-pulse rounded-xl bg-slate-100" />}
      {isError && !isLoading && (
        <Text variant="body" className="py-10 text-rose-600">
          {errorMessage ?? "Failed to load bill calendar."}
        </Text>
      )}
      {!isLoading && !isError && (
        <>
          <DayPicker
            mode="single"
            month={month}
            selected={selectedDate}
            onSelect={(date) => date && onSelectDate(date)}
            onMonthChange={onMonthChange}
            showOutsideDays
            hideNavigation
            components={{ DayButton }}
            className="w-full"
            classNames={{
              root: "w-full",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full border-collapse text-sm",
              weekdays: "grid grid-cols-7 text-xs font-semibold text-gray-500",
              weekday: "py-3 text-center",
              weeks: "grid gap-0",
              week: "grid grid-cols-7",
              day: "min-h-14 border border-gray-100 text-center",
              day_button:
                "h-14 w-full rounded-none text-sm font-semibold text-text-primary transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 justify-center",
              outside: "text-gray-400",
              selected: "bg-transparent",
              today: "bg-orange-50",
            }}
            modifiersClassNames={{
              selected: "[&>button]:bg-primary [&>button]:text-white [&>button]:rounded-full [&>button]:mx-auto [&>button]:my-2 [&>button]:h-9 [&>button]:w-9",
              today: "[&>button]:text-orange-600",
            }}
          />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-600">
            {[
              ["Due Soon", "bg-orange-500"],
              ["Overdue", "bg-rose-500"],
              ["Upcoming", "bg-blue-500"],
              ["Paid", "bg-emerald-500"],
            ].map(([label, color]) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", color)} />
                {label}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export default BillsCalendar;
