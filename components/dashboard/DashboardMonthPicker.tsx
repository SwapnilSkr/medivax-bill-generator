"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Check, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildLastTwoYearsMonthOptions,
  type DashboardDateFilter,
  dateToLocalIsoDay,
  formatDashboardRangeLabel,
  formatYearMonthDisplay,
  localIsoDayToDate,
  normalizeRangeDays,
} from "@/lib/dashboardMonthFilter";

export type DashboardDateFilterBarProps = {
  prefixId: string;
  primaryLabel: string;
  value: DashboardDateFilter;
  onChange: (next: DashboardDateFilter) => void;
  descriptionId?: string;
};

/**
 * Month + range controls in one row (shares the right half of the toolbar with the count).
 */
export function DashboardDateFilterBar({
  prefixId,
  primaryLabel,
  value,
  onChange,
  descriptionId,
}: DashboardDateFilterBarProps) {
  const monthLabelId = `${prefixId}-month-label`;
  const rangeLabelId = `${prefixId}-range-label`;
  const monthTriggerId = `${prefixId}-month-menu`;
  const rangeTriggerId = `${prefixId}-range-popover`;

  const monthOptions = useMemo(() => buildLastTwoYearsMonthOptions(), []);

  const monthTriggerText =
    value.mode === "month" ? formatYearMonthDisplay(value.ym) : "Any month";

  const rangeTriggerText =
    value.mode === "range"
      ? formatDashboardRangeLabel(value.from, value.to)
      : "Date range";

  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeSelected, setRangeSelected] = useState<DateRange | undefined>();

  const handleRangeOpenChange = (open: boolean) => {
    setRangeOpen(open);
    if (open) {
      if (value.mode === "range") {
        const from = localIsoDayToDate(value.from);
        const to = localIsoDayToDate(value.to);
        if (from && to) {
          setRangeSelected({ from, to });
        } else {
          setRangeSelected(undefined);
        }
      } else {
        setRangeSelected(undefined);
      }
    }
  };

  const rangeMonthStart = new Date(new Date().getFullYear() - 2, 0);
  const rangeMonthEnd = new Date(new Date().getFullYear() + 1, 11);

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3 sm:flex-nowrap sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1 basis-[calc(50%-0.375rem)] sm:basis-auto">
        <span
          id={monthLabelId}
          className="text-xs font-medium leading-none text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 opacity-80" aria-hidden />
            {primaryLabel}
          </span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id={monthTriggerId}
              type="button"
              variant="outline"
              aria-labelledby={monthLabelId}
              aria-describedby={descriptionId}
              className="h-9 w-full justify-between gap-2 px-3 font-normal sm:min-w-42"
            >
              <span className="truncate text-left">{monthTriggerText}</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground opacity-80"
                aria-hidden
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-[min(22rem,70vh)] w-(--radix-dropdown-menu-trigger-width) min-w-48 overflow-y-auto sm:w-56"
          >
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={() => onChange({ mode: "none" })}
            >
              <Check
                className={`size-4 shrink-0 ${value.mode === "none" ? "opacity-100" : "opacity-0"}`}
                aria-hidden
              />
              All months
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {monthOptions.map((opt) => {
              const active = value.mode === "month" && value.ym === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  className="flex items-center gap-2"
                  onSelect={() => onChange({ mode: "month", ym: opt.value })}
                >
                  <Check
                    className={`size-4 shrink-0 ${active ? "opacity-100" : "opacity-0"}`}
                    aria-hidden
                  />
                  <span className="truncate">{opt.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 basis-[calc(50%-0.375rem)] sm:basis-auto">
        <span
          id={rangeLabelId}
          className="text-xs font-medium leading-none text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarRange className="size-3.5 shrink-0 opacity-80" aria-hidden />
            Range
          </span>
        </span>
        <Popover open={rangeOpen} onOpenChange={handleRangeOpenChange}>
          <PopoverTrigger asChild>
            <Button
              id={rangeTriggerId}
              type="button"
              variant="outline"
              aria-labelledby={rangeLabelId}
              aria-describedby={descriptionId}
              className="h-9 w-full justify-between gap-2 px-3 font-normal sm:min-w-42"
            >
              <span className="truncate text-left">{rangeTriggerText}</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground opacity-80"
                aria-hidden
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-auto max-w-[calc(100vw-2rem)] p-0"
          >
            <Calendar
              mode="range"
              captionLayout="dropdown"
              numberOfMonths={2}
              pagedNavigation
              showOutsideDays={false}
              startMonth={rangeMonthStart}
              endMonth={rangeMonthEnd}
              selected={rangeSelected}
              defaultMonth={rangeSelected?.from ?? rangeSelected?.to ?? new Date()}
              onSelect={(range) => {
                setRangeSelected(range);
                if (range?.from && range?.to) {
                  const fromIso = dateToLocalIsoDay(range.from);
                  const toIso = dateToLocalIsoDay(range.to);
                  const norm = normalizeRangeDays(fromIso, toIso);
                  onChange({ mode: "range", from: norm.from, to: norm.to });
                }
              }}
            />
            {value.mode === "range" ? (
              <div className="border-t border-border p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-muted-foreground"
                  onClick={() => {
                    setRangeSelected(undefined);
                    onChange({ mode: "none" });
                    setRangeOpen(false);
                  }}
                >
                  Clear range
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
