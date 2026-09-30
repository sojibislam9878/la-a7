"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowUpDownIcon, PencilIcon, PlusIcon, RotateCwIcon, SproutIcon, Trash2Icon } from "lucide-react"
import { z } from "zod"

import { CropTypeDialog } from "@/components/admin/crop-types/crop-type-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { UrlSearchInput } from "@/components/shared/url-search-input"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCropTypeList, useDeleteCropType } from "@/hooks/use-crop-types"
import type { CropTypeListQuery } from "@/lib/api/crop-types"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatNumber, formatTempRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CropType } from "@/types/crop-type"

const PAGE_SIZE = 100

const SORTS = [
  { value: "name:asc", label: "Name, A to Z", sortBy: "name", sortOrder: "asc" },
  { value: "maxStorageDays:desc", label: "Longest storage", sortBy: "maxStorageDays", sortOrder: "desc" },
  { value: "maxStorageDays:asc", label: "Shortest storage", sortBy: "maxStorageDays", sortOrder: "asc" },
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
] as const
const DEFAULT_SORT = SORTS[0].value

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)
const stateSchema = z.object({
  q: optional(z.string().trim().min(1).max(60)),
  sort: optional(z.enum(SORTS.map((s) => s.value) as [string, ...string[]])),
  page: optional(z.coerce.number().int().positive()),
})
type State = z.infer<typeof stateSchema>

function parse(params: URLSearchParams): State {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return stateSchema.parse(record)
}

function serialize(state: State) {
  const params = new URLSearchParams()
  if (state.q) params.set("q", state.q)
  if (state.sort && state.sort !== DEFAULT_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}

function toQuery(state: State): CropTypeListQuery {
  const sort = SORTS.find((s) => s.value === (state.sort ?? DEFAULT_SORT)) ?? SORTS[0]
  return {
    ...(state.q ? { search: state.q } : {}),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: state.page ?? 1,
    limit: PAGE_SIZE,
  }
}

function scaleFor(items: CropType[]) {
  const low = Math.min(0, ...items.map((crop) => crop.idealMinTempC))
  const high = Math.max(10, ...items.map((crop) => crop.idealMaxTempC))
  const min = Math.floor((low - 1) / 5) * 5
  const max = Math.ceil((high + 1) / 5) * 5
  const ticks: number[] = []
  for (let value = min; value <= max; value += 5) ticks.push(value)
  return { min, max, ticks, at: (value: number) => ((value - min) / (max - min)) * 100 }
}

type Scale = ReturnType<typeof scaleFor>

const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_7.5rem_6.5rem_5.5rem]"

function Axis({ scale }: { scale: Scale }) {
  return (
    <div className={cn(ROW_GRID, "px-4 pb-1 text-xs text-muted-foreground")} aria-hidden>
      <span className="hidden lg:block">Crop</span>
      <div className="relative col-span-2 h-4 lg:col-span-1">
        {scale.ticks.map((tick) => (
          <span key={tick} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${scale.at(tick)}%` }}>
            {tick}°
          </span>
        ))}
      </div>
      <span className="hidden lg:block">Ideal range</span>
      <span className="hidden lg:block">Max storage</span>
      <span className="hidden lg:block" />
    </div>
  )
}

function RangeTrack({ crop, scale }: { crop: CropType; scale: Scale }) {
  const left = scale.at(crop.idealMinTempC)
  const width = Math.max(scale.at(crop.idealMaxTempC) - left, 0)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative col-span-2 h-6 lg:col-span-1" role="img" aria-label={`${crop.name}: ${formatTempRange(crop.idealMinTempC, crop.idealMaxTempC)}`}>
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          <div className="absolute top-0 bottom-0 w-px bg-muted-foreground/40" style={{ left: `${scale.at(0)}%` }} />
          <div
            className="absolute top-1/2 h-3 min-w-2 -translate-y-1/2 rounded-[4px] bg-sky-600"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        {crop.name}: {formatTempRange(crop.idealMinTempC, crop.idealMaxTempC)}, up to {crop.maxStorageDays} days
      </TooltipContent>
    </Tooltip>
  )
}

function CropRow({ crop, scale }: { crop: CropType; scale: Scale }) {
  const [editing, setEditing] = useState(false)
  const remove = useDeleteCropType()

  return (
    <li className={cn(ROW_GRID, "rounded-2xl px-4 py-3 transition-colors hover:bg-cream/50 dark:hover:bg-muted/30")}>
      <p className="truncate font-semibold">{crop.name}</p>
      <div className="flex justify-end gap-1 lg:order-last">
        <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={`Edit ${crop.name}`} onClick={() => setEditing(true)}>
          <PencilIcon />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full text-destructive hover:text-destructive" aria-label={`Delete ${crop.name}`}>
              <Trash2Icon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {crop.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Farmers won&apos;t be able to book it anymore. This is refused while any active booking stores this crop.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => remove.mutate({ id: crop.id, name: crop.name })}>
                Delete crop type
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <RangeTrack crop={crop} scale={scale} />
      <p className="text-sm tabular-nums">{formatTempRange(crop.idealMinTempC, crop.idealMaxTempC)}</p>
      <p className="text-right text-sm text-muted-foreground tabular-nums lg:text-left">
        {formatNumber(crop.maxStorageDays)} days
      </p>
      <CropTypeDialog crop={crop} open={editing} onOpenChange={setEditing} />
    </li>
  )
}

export function CropTypesAdmin() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parse(new URLSearchParams(current)), [current])
  const query = useMemo(() => toQuery(state), [state])
  const crops = useCropTypeList(query)
  const [adding, setAdding] = useState(false)

  const hrefFor = (next: State) => {
    const qs = serialize(next)
    return qs ? `${pathname}?${qs}` : pathname
  }
  const commitSearch = useCallback(
    (q: string) => {
      const qs = serialize({ ...parse(new URLSearchParams(current)), q: q || undefined, page: undefined })
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [current, pathname, router]
  )

  const data = crops.data
  const scale = useMemo(() => scaleFor(data?.items ?? []), [data])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Crop types"
        description="The crops farmers can book, their ideal storage temperature and the longest safe stay."
        actions={
          <Button className="rounded-full" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add crop type
          </Button>
        }
      />
      <CropTypeDialog open={adding} onOpenChange={setAdding} />

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput
          id="crop-search"
          urlValue={state.q ?? ""}
          onCommit={commitSearch}
          label="Search crop types"
          placeholder="Search crop types"
          className="w-full min-w-60 sm:w-auto sm:flex-1"
        />
        <Select
          value={state.sort ?? DEFAULT_SORT}
          onValueChange={(sort) => router.replace(hrefFor({ ...state, sort, page: undefined }), { scroll: false })}
        >
          <SelectTrigger
            aria-label="Sort crop types"
            className="h-10! w-full rounded-xl border-soil/15 bg-card text-left sm:w-48 *:data-[slot=select-value]:grow"
          >
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {SORTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {crops.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load crop types</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(crops.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => crops.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <Skeleton className="h-96 rounded-3xl" aria-busy="true" aria-label="Loading crop types" />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={SproutIcon}
          title={state.q ? "No crop types match" : "No crop types yet"}
          description={state.q ? "Try another name." : "Add the crops farmers store, with their ideal temperature."}
          action={
            state.q ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={pathname}>Clear search</Link>
              </Button>
            ) : (
              <Button className="rounded-full" onClick={() => setAdding(true)}>
                <PlusIcon data-icon="inline-start" aria-hidden />
                Add crop type
              </Button>
            )
          }
        />
      ) : (
        <section
          aria-labelledby="crop-list-heading"
          className={cn(
            "flex flex-col gap-2 rounded-3xl border border-soil/10 bg-card py-4 transition-opacity",
            crops.isPlaceholderData && "opacity-60"
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-4">
            <h2 id="crop-list-heading" className="font-semibold">
              Ideal storage temperature
            </h2>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {formatNumber(data.meta.total)} {data.meta.total === 1 ? "crop type" : "crop types"} · line marks 0°C
            </p>
          </div>
          <Axis scale={scale} />
          <ul className="flex flex-col">
            {data.items.map((crop) => (
              <CropRow key={crop.id} crop={crop} scale={scale} />
            ))}
          </ul>
        </section>
      )}

      {data && (
        <PageLinks
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          hrefFor={(page) => hrefFor({ ...state, page })}
          scroll={false}
        />
      )}
    </div>
  )
}
