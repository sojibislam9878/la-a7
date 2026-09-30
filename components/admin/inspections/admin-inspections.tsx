"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowUpDownIcon,
  ClipboardCheckIcon,
  DropletsIcon,
  RotateCwIcon,
  ScaleIcon,
  Undo2Icon,
  UserRoundIcon,
  WarehouseIcon,
} from "lucide-react"

import { GradeMark } from "@/components/admin/inspections/grade-badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { QUALITY_GRADE, QUALITY_GRADES } from "@/constants/quality-grade"
import { useGradeCounts, useInspections } from "@/hooks/use-inspections"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatNumber } from "@/lib/format"
import {
  DEFAULT_INSPECTION_SORT,
  INSPECTION_SORT_OPTIONS,
  type InspectionListState,
  parseInspectionState,
  serializeInspectionState,
  toInspectionQuery,
} from "@/lib/inspection-query"
import { cn } from "@/lib/utils"
import type { Inspection } from "@/types/admin"
import type { QualityGrade } from "@/types/booking"

function variance(inspection: Inspection) {
  const declared = inspection.booking.quantityKg
  const diff = inspection.actualQtyKg - declared
  if (diff === 0) return { text: "Matches declared", large: false }
  const percent = Math.round((Math.abs(diff) / declared) * 1000) / 10
  return {
    text: `${diff > 0 ? "+" : "−"}${formatNumber(Math.abs(diff))} kg (${percent}%) vs declared`,
    large: percent >= 10,
  }
}

function GradeTiles({ state, hrefFor }: { state: InspectionListState; hrefFor: (next: InspectionListState) => string }) {
  const counts = useGradeCounts()
  const total = counts ? QUALITY_GRADES.reduce((sum, grade) => sum + counts[grade], 0) : null
  const tiles: { value: QualityGrade | undefined; label: string; count: number | null }[] = [
    { value: undefined, label: "All grades", count: total },
    ...QUALITY_GRADES.map((grade) => ({ value: grade, label: QUALITY_GRADE[grade].label, count: counts?.[grade] ?? null })),
  ]

  return (
    <nav aria-label="Filter by grade">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const active = state.grade === tile.value
          const share = tile.value && total && tile.count !== null ? Math.round((tile.count / total) * 100) : null
          return (
            <li key={tile.label} className={cn(!tile.value && "col-span-2 sm:col-span-1")}>
              <Link
                href={hrefFor({ ...state, grade: tile.value, page: undefined })}
                replace
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full items-center gap-3 rounded-2xl border bg-card p-3 transition-colors",
                  active ? "border-primary ring-2 ring-primary/20" : "border-soil/10 hover:border-primary/40"
                )}
              >
                {tile.value ? (
                  <GradeMark grade={tile.value} />
                ) : (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ClipboardCheckIcon className="size-4" aria-hidden />
                  </span>
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">{tile.label}</span>
                  {tile.count === null ? (
                    <Skeleton className="mt-1 h-5 w-10" />
                  ) : (
                    <span className="text-lg leading-tight font-bold tabular-nums">
                      {formatNumber(tile.count)}
                      {share !== null && <span className="ml-1.5 text-xs font-medium text-muted-foreground">{share}%</span>}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const meta = QUALITY_GRADE[inspection.grade]
  const diff = variance(inspection)
  const rejected = inspection.grade === "REJECTED"

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-soil/10 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <GradeMark grade={inspection.grade} className="size-10 text-base" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="flex flex-wrap items-center gap-x-2">
              <span className="font-mono text-sm font-semibold">{inspection.booking.lotCode}</span>
              <span className={cn("text-sm font-semibold", rejected && "text-destructive")}>{meta.label}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <UserRoundIcon className="size-4" aria-hidden />
                {inspection.booking.farmer.name}
              </span>
              <span className="flex items-center gap-1.5">
                <WarehouseIcon className="size-4" aria-hidden />
                {inspection.booking.warehouse.name}
              </span>
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right">
          <time dateTime={inspection.inspectedAt}>{format(parseISO(inspection.inspectedAt), "MMM d, yyyy, h:mm a")}</time>
          <br />
          by {inspection.inspector.name}
        </p>
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-xl bg-cream/60 px-3 py-2 dark:bg-muted/40">
          <ScaleIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Weighed</dt>
            <dd className="text-sm font-medium">
              {formatNumber(inspection.actualQtyKg)} kg{" "}
              <span className={cn("text-xs font-normal", diff.large ? "text-harvest-foreground dark:text-harvest" : "text-muted-foreground")}>
                {diff.text}
              </span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-cream/60 px-3 py-2 dark:bg-muted/40">
          <DropletsIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Moisture</dt>
            <dd className="text-sm font-medium">
              {inspection.moisturePct === null ? "Not measured" : `${inspection.moisturePct}%`}
            </dd>
          </div>
        </div>
      </dl>

      {(inspection.notes || rejected) && (
        <div className="flex flex-col gap-3 border-t border-soil/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {inspection.notes ? `“${inspection.notes}”` : "No notes recorded."}
          </p>
          {rejected && (
            <Button variant="outline" size="sm" className="shrink-0 rounded-full" asChild>
              <Link href={`/admin/payments?q=${encodeURIComponent(inspection.booking.lotCode)}`}>
                <Undo2Icon data-icon="inline-start" aria-hidden />
                Check refund
              </Link>
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

export function AdminInspections() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseInspectionState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toInspectionQuery(state), [state])
  const inspections = useInspections(query)

  const hrefFor = (next: InspectionListState) => {
    const qs = serializeInspectionState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const data = inspections.data

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Inspections"
        description="Quality grades recorded at intake. Rejected lots are cancelled and need their payment refunded."
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/admin/bookings?status=PAID">
              <ClipboardCheckIcon data-icon="inline-start" aria-hidden />
              Lots due for intake
            </Link>
          </Button>
        }
      />

      <GradeTiles state={state} hrefFor={hrefFor} />

      {inspections.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load inspections</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(inspections.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => inspections.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading inspections">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ClipboardCheckIcon}
          title={state.grade ? `No ${QUALITY_GRADE[state.grade].label.toLowerCase()} lots` : "No inspections yet"}
          description={
            state.grade
              ? "No lot has been given this grade yet."
              : "Inspections are recorded from All bookings when a paid lot arrives at the warehouse."
          }
          action={
            <Button variant="outline" className="rounded-full" asChild>
              <Link href={state.grade ? pathname : "/admin/bookings?status=PAID"}>
                {state.grade ? "Show all grades" : "Lots due for intake"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", inspections.isPlaceholderData && "opacity-60")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {formatNumber(data.meta.total)} {data.meta.total === 1 ? "inspection" : "inspections"}
            </p>
            <Select
              value={state.sort ?? DEFAULT_INSPECTION_SORT}
              onValueChange={(sort) =>
                router.replace(hrefFor({ ...state, sort: sort as InspectionListState["sort"], page: undefined }), {
                  scroll: false,
                })
              }
            >
              <SelectTrigger
                aria-label="Sort inspections"
                className="h-10! w-full shrink-0 rounded-xl border-soil/15 bg-card text-left sm:w-44 *:data-[slot=select-value]:grow"
              >
                <ArrowUpDownIcon aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" position="popper">
                {INSPECTION_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ul className="flex flex-col gap-3">
            {data.items.map((inspection) => (
              <li key={inspection.id}>
                <InspectionCard inspection={inspection} />
              </li>
            ))}
          </ul>
          <PageLinks
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            hrefFor={(page) => hrefFor({ ...state, page })}
            scroll={false}
          />
        </div>
      )}
    </div>
  )
}
