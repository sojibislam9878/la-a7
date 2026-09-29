"use client"

import { useId, useState } from "react"
import { BoxesIcon, PencilIcon, ThermometerSnowflakeIcon, Trash2Icon } from "lucide-react"

import { ChamberFormDialog } from "@/components/owner/chambers/chamber-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useDeleteChamber, useUpdateChamber } from "@/hooks/use-chambers"
import { formatKg, formatTempRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import { cropFitsChamber } from "@/schemas/booking"
import type { CropType } from "@/types/crop-type"
import type { Chamber, ChamberAvailabilitySummary } from "@/types/warehouse"

const MAX_CROPS = 4

function LoadBar({ load, loading }: { load?: ChamberAvailabilitySummary; loading: boolean }) {
  if (loading) return <Skeleton className="h-10 w-full rounded-xl" />
  if (!load) return null

  const percent = load.capacityKg > 0 ? Math.min(100, Math.round((load.peakUsedKg / load.capacityKg) * 100)) : 0
  const tone = percent >= 90 ? "bg-destructive" : percent >= 70 ? "bg-harvest" : "bg-primary"

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Peak booked, next 30 days</span>
        <span className="font-semibold tabular-nums">
          {formatKg(load.peakUsedKg)} of {formatKg(load.capacityKg)} · {percent}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label="Peak booked load in the next 30 days"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={cn("h-full rounded-full transition-[width]", tone)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function ChamberCard({
  warehouseId,
  chamber,
  cropTypes,
  load,
  loadLoading,
}: {
  warehouseId: string
  chamber: Chamber
  cropTypes: CropType[]
  load?: ChamberAvailabilitySummary
  loadLoading: boolean
}) {
  const [editing, setEditing] = useState(false)
  const update = useUpdateChamber(warehouseId)
  const remove = useDeleteChamber(warehouseId)
  const switchId = useId()
  const fitting = cropTypes.filter((crop) => cropFitsChamber(crop, chamber))

  return (
    <article
      className={cn(
        "flex w-full flex-col gap-4 rounded-3xl border bg-card p-5 transition-colors",
        chamber.isActive ? "border-soil/10" : "border-dashed border-soil/25 bg-card/60"
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-bold",
              chamber.isActive ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" : "bg-muted text-muted-foreground"
            )}
          >
            {chamber.name.slice(0, 4)}
          </span>
          <div>
            <h3 className="font-semibold">Chamber {chamber.name}</h3>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThermometerSnowflakeIcon className="size-4" aria-hidden />
                {formatTempRange(chamber.minTempC, chamber.maxTempC)}
              </span>
              <span className="flex items-center gap-1">
                <BoxesIcon className="size-4" aria-hidden />
                {formatKg(chamber.capacityKg)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={switchId}
            checked={chamber.isActive}
            disabled={update.isPending}
            onCheckedChange={(isActive) => update.mutate({ id: chamber.id, payload: { isActive } })}
          />
          <label htmlFor={switchId} className="text-sm font-medium">
            {chamber.isActive ? "Taking bookings" : "Paused"}
          </label>
        </div>
      </header>

      {chamber.isActive ? (
        <LoadBar load={load} loading={loadLoading} />
      ) : (
        <p className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Hidden from farmers. Lots already booked here are unaffected.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">Fits these crops</p>
        {fitting.length === 0 ? (
          <p className="text-sm text-harvest-foreground dark:text-harvest">
            No crop fits this range, so it can&apos;t be booked.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {fitting.slice(0, MAX_CROPS).map((crop) => (
              <li key={crop.id} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {crop.name}
              </li>
            ))}
            {fitting.length > MAX_CROPS && (
              <li
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                title={fitting.slice(MAX_CROPS).map((crop) => crop.name).join(", ")}
              >
                +{fitting.length - MAX_CROPS} more
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-soil/10 pt-4">
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditing(true)}>
          <PencilIcon data-icon="inline-start" aria-hidden />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive">
              <Trash2Icon data-icon="inline-start" aria-hidden />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chamber {chamber.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Its {formatKg(chamber.capacityKg)} of capacity leaves your listing. This is refused while any lot is paid
                for or stored in it. To stop new bookings only, pause it instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep chamber</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => remove.mutate({ id: chamber.id, name: chamber.name })}>
                Delete chamber
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ChamberFormDialog
        warehouseId={warehouseId}
        chamber={chamber}
        cropTypes={cropTypes}
        open={editing}
        onOpenChange={setEditing}
      />
    </article>
  )
}
