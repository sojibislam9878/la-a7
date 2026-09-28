"use client"

import { useState } from "react"
import { format, parseISO, startOfToday } from "date-fns"
import { CalendarRangeIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { inclusiveDays } from "@/lib/availability-query"
import { cn } from "@/lib/utils"

const toIso = (date: Date) => format(date, "yyyy-MM-dd")
const pretty = (iso: string) => format(parseISO(iso), "MMM d, yyyy")

export function DateRangeField({
  id,
  startDate,
  endDate,
  onChange,
  invalid,
}: {
  id: string
  startDate: string
  endDate: string
  onChange: (range: { startDate: string; endDate: string }) => void
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [today] = useState(startOfToday)

  const selected: DateRange | undefined = startDate
    ? { from: parseISO(startDate), to: endDate ? parseISO(endDate) : undefined }
    : undefined

  const label =
    startDate && endDate
      ? `${pretty(startDate)} to ${pretty(endDate)}`
      : startDate
        ? `${pretty(startDate)} to ...`
        : "Pick start and end dates"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn(
            "h-auto min-h-11 w-full justify-start gap-2 rounded-xl border-soil/15 bg-cream/60 px-3.5 py-2 text-left font-normal dark:bg-input/20",
            !startDate && "text-muted-foreground"
          )}
        >
          <CalendarRangeIcon className="text-muted-foreground" aria-hidden />
          <span className="flex flex-col">
            <span>{label}</span>
            {startDate && endDate && (
              <span className="text-xs text-muted-foreground">{inclusiveDays(startDate, endDate)} days</span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selected}
          defaultMonth={selected?.from ?? today}
          disabled={{ before: today }}
          numberOfMonths={1}
          onSelect={(range) => {
            onChange({
              startDate: range?.from ? toIso(range.from) : "",
              endDate: range?.to ? toIso(range.to) : "",
            })
            if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
