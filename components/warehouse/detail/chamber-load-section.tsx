"use client"

import dynamic from "next/dynamic"
import { format, parseISO } from "date-fns"
import { ChartColumnIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useAvailabilitySelection, useChamberAvailability, useWarehouseAvailability } from "@/hooks/use-availability"
import { getErrorMessage } from "@/lib/api/form-errors"
import { pickChamber } from "@/lib/availability-pick"
import { DAILY_BREAKDOWN_MAX_DAYS } from "@/lib/availability-query"
import { formatKg } from "@/lib/format"

const ChamberLoadChart = dynamic(() => import("@/components/warehouse/detail/chamber-load-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 rounded-2xl" />,
})

export function ChamberLoadSection({ warehouseId }: { warehouseId: string }) {
  const { selection, params } = useAvailabilitySelection()
  const warehouseAvailability = useWarehouseAvailability(warehouseId, params)
  const chamber = pickChamber(warehouseAvailability.data, selection)
  const tooLong = (warehouseAvailability.data?.window.days ?? 0) > DAILY_BREAKDOWN_MAX_DAYS
  const load = useChamberAvailability(tooLong ? undefined : chamber?.id, params)

  if (!params || !chamber) return null

  const days = load.data?.dailyBreakdown

  return (
    <section aria-labelledby="load-heading" className="flex flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="load-heading" className="flex items-center gap-2 font-display text-2xl font-semibold">
            <ChartColumnIcon className="size-5 text-primary" aria-hidden />
            Daily load, chamber {chamber.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Kilograms already booked each day from {format(parseISO(params.startDate), "MMM d")} to{" "}
            {format(parseISO(params.endDate), "MMM d")}. Your booking must fit under the busiest day.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatKg(chamber.availableKg)}</span> free all window
        </p>
      </div>

      {tooLong ? (
        <p className="rounded-2xl bg-cream/60 px-4 py-6 text-center text-sm text-muted-foreground dark:bg-muted/40">
          The daily breakdown covers windows of up to {DAILY_BREAKDOWN_MAX_DAYS} days. Pick a shorter range to see it.
        </p>
      ) : load.isError ? (
        <p className="text-sm text-destructive">{getErrorMessage(load.error)}</p>
      ) : !days ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          {days.every((day) => day.usedKg === 0) && (
            <p className="text-sm text-muted-foreground">Nothing is booked in this window yet. The whole chamber is free.</p>
          )}
          <ChamberLoadChart days={days} capacityKg={chamber.capacityKg} />
          <table className="sr-only">
            <caption>Daily booked and free kilograms for chamber {chamber.name}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Booked</th>
                <th scope="col">Free</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{format(parseISO(day.date), "MMM d, yyyy")}</th>
                  <td>{formatKg(day.usedKg)}</td>
                  <td>{formatKg(day.freeKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
