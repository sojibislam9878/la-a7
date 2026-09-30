"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns"
import {
  AlertCircleIcon,
  ArrowUpDownIcon,
  BotIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  FilterIcon,
  HistoryIcon,
  RotateCwIcon,
  XIcon,
} from "lucide-react"

import { RoleBadge } from "@/components/admin/users/user-badges"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AUDIT_ACTION,
  AUDIT_ACTIONS,
  AUDIT_ENTITY,
  AUDIT_ENTITY_TYPES,
  type AuditEntityType,
  auditActionLabel,
} from "@/constants/audit-log"
import { useAuditLogs } from "@/hooks/use-admin-users"
import { getErrorMessage } from "@/lib/api/form-errors"
import { auditDiff, describeAudit, formatAuditValue, humanizeKey } from "@/lib/audit-describe"
import {
  type AuditLogListState,
  parseAuditLogState,
  serializeAuditLogState,
  toAuditLogQuery,
} from "@/lib/audit-log-query"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AuditLogEntry } from "@/types/admin"

const ANY = "any"
const triggerClass = "h-10! w-full rounded-xl border-soil/15 bg-card text-left sm:w-60 *:data-[slot=select-value]:grow"

const isEntityType = (value: string): value is AuditEntityType => (AUDIT_ENTITY_TYPES as readonly string[]).includes(value)

function dayLabel(iso: string) {
  const date = parseISO(iso)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE, MMM d, yyyy")
}

function groupByDay(entries: AuditLogEntry[]) {
  const groups: { key: string; label: string; entries: AuditLogEntry[] }[] = []
  for (const entry of entries) {
    const key = format(parseISO(entry.createdAt), "yyyy-MM-dd")
    const last = groups.at(-1)
    if (last?.key === key) last.entries.push(entry)
    else groups.push({ key, label: dayLabel(entry.createdAt), entries: [entry] })
  }
  return groups
}

function Value({ field, value }: { field: string; value: unknown }) {
  const formatted = formatAuditValue(field, value)
  return (
    <span title={formatted.title} className={cn("break-words", formatted.mono && "font-mono text-xs")}>
      {formatted.text}
    </span>
  )
}

function DiffTable({ entry }: { entry: AuditLogEntry }) {
  const rows = auditDiff(entry)
  if (rows.length === 0) return null
  const showBefore = rows[0].hasBefore
  const showAfter = rows[0].hasAfter

  return (
    <details className="group rounded-xl border border-soil/10 bg-cream/40 dark:bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
        {showBefore && showAfter ? "Before and after" : showAfter ? "Recorded values" : "Removed values"}
      </summary>
      <div className="overflow-x-auto px-3 pb-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th scope="col" className="py-1.5 pr-4 font-medium">Field</th>
              {showBefore && <th scope="col" className="py-1.5 pr-4 font-medium">Before</th>}
              {showAfter && <th scope="col" className="py-1.5 font-medium">After</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-soil/10">
            {rows.map((row) => (
              <tr key={row.key} className="align-top">
                <th scope="row" className="py-1.5 pr-4 text-left font-normal whitespace-nowrap text-muted-foreground">
                  {humanizeKey(row.key)}
                </th>
                {showBefore && (
                  <td className={cn("py-1.5 pr-4", row.changed && showAfter && "text-muted-foreground line-through decoration-soil/40")}>
                    <Value field={row.key} value={row.before} />
                  </td>
                )}
                {showAfter && (
                  <td className={cn("py-1.5", row.changed && showBefore && "font-semibold")}>
                    <Value field={row.key} value={row.after} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function EntryCard({
  entry,
  state,
  hrefFor,
}: {
  entry: AuditLogEntry
  state: AuditLogListState
  hrefFor: (next: AuditLogListState) => string
}) {
  const type = isEntityType(entry.entityType) ? entry.entityType : null
  const Icon = entry.action.startsWith("PAYMENT_")
    ? AUDIT_ENTITY.Payment.icon
    : entry.action === "INSPECTION_RECORDED"
      ? ClipboardCheckIcon
      : type
        ? AUDIT_ENTITY[type].icon
        : HistoryIcon
  const { detail, reason } = describeAudit(entry)
  const created = parseISO(entry.createdAt)
  const singular = type ? AUDIT_ENTITY[type].singular : "record"

  return (
    <article className="flex gap-3 rounded-2xl border border-soil/10 bg-card p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 text-sm">
            <span className="font-semibold">{auditActionLabel(entry.action)}</span>
            {detail && <span className="text-muted-foreground"> · {detail}</span>}
          </p>
          <time
            dateTime={entry.createdAt}
            title={format(created, "MMM d, yyyy 'at' h:mm:ss a")}
            className="shrink-0 text-xs text-muted-foreground tabular-nums"
          >
            {format(created, "h:mm a")} · {formatDistanceToNowStrict(created, { addSuffix: true })}
          </time>
        </div>

        {reason && <p className="text-sm text-muted-foreground">“{reason}”</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          {entry.actor ? (
            <span className="flex items-center gap-1.5">
              <Link
                href={hrefFor({ ...state, actor: entry.actor.id, page: undefined })}
                scroll={false}
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                title={`Show everything ${entry.actor.name} did`}
              >
                {entry.actor.name}
              </Link>
              <RoleBadge role={entry.actor.role} className="h-5 px-2 text-[11px]" />
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <BotIcon className="size-3.5" aria-hidden />
              System (Stripe webhook)
            </span>
          )}
          {state.entity !== entry.entityId && (
            <Link
              href={hrefFor({ entity: entry.entityId, sort: state.sort })}
              scroll={false}
              className="flex items-center gap-1 underline-offset-4 hover:text-primary hover:underline"
            >
              <HistoryIcon className="size-3.5" aria-hidden />
              History of this {singular}
            </Link>
          )}
          {entry.entityType === "User" && (
            <Link href={`/admin/users/${entry.entityId}`} className="underline-offset-4 hover:text-primary hover:underline">
              Open account
            </Link>
          )}
          {entry.ip && <span className="font-mono">IP {entry.ip === "::1" ? "localhost" : entry.ip}</span>}
        </div>

        <DiffTable entry={entry} />
      </div>
    </article>
  )
}

export function AuditLogs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseAuditLogState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toAuditLogQuery(state), [state])
  const logs = useAuditLogs(query)

  const hrefFor = (next: AuditLogListState) => {
    const qs = serializeAuditLogState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }
  const go = (next: AuditLogListState) => router.replace(hrefFor({ ...next, page: undefined }), { scroll: false })

  const data = logs.data
  const actions = AUDIT_ACTIONS.filter((action) => !state.type || AUDIT_ACTION[action].entityType === state.type)
  const actorName = state.actor ? data?.items.find((entry) => entry.actor?.id === state.actor)?.actor?.name : undefined
  const narrowed = !!(state.type || state.action || state.actor || state.entity)
  const groups = data ? groupByDay(data.items) : []

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Audit logs"
        description="Every booking step, payment, ban, role change, warehouse decision and review, with who did it and what changed."
      />

      <nav aria-label="Filter by record type" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-1.5">
          {[undefined, ...AUDIT_ENTITY_TYPES].map((type) => {
            const active = state.type === type
            return (
              <li key={type ?? "all"}>
                <Link
                  href={hrefFor({
                    ...state,
                    type,
                    action: type && state.action && AUDIT_ACTION[state.action].entityType !== type ? undefined : state.action,
                    page: undefined,
                  })}
                  replace
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-soil/15 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {type ? AUDIT_ENTITY[type].label : "Everything"}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={state.action ?? ANY} onValueChange={(value) => go({ ...state, action: value === ANY ? undefined : value })}>
          <SelectTrigger aria-label="Filter by action" className={triggerClass}>
            <FilterIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ANY}>Any action</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {AUDIT_ACTION[action].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={state.sort ?? "desc"}
          onValueChange={(sort) => go({ ...state, sort: sort as AuditLogListState["sort"] })}
        >
          <SelectTrigger aria-label="Sort entries" className={cn(triggerClass, "sm:w-44")}>
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        {(state.actor || state.entity) && (
          <ul className="flex flex-wrap gap-2" aria-label="Active filters">
            {state.actor && (
              <li>
                <Link
                  href={hrefFor({ ...state, actor: undefined, page: undefined })}
                  replace
                  scroll={false}
                  aria-label={`Remove filter: done by ${actorName ?? "one person"}`}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary hover:bg-primary/15"
                >
                  Done by {actorName ?? "one person"}
                  <XIcon className="size-3.5" aria-hidden />
                </Link>
              </li>
            )}
            {state.entity && (
              <li>
                <Link
                  href={hrefFor({ ...state, entity: undefined, page: undefined })}
                  replace
                  scroll={false}
                  aria-label="Remove filter: one record"
                  className="flex h-9 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary hover:bg-primary/15"
                >
                  One record <span className="font-mono text-xs">{state.entity.slice(0, 8)}…</span>
                  <XIcon className="size-3.5" aria-hidden />
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>

      {logs.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load the audit log</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(logs.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => logs.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading audit log">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={narrowed ? "No matching entries" : "Nothing logged yet"}
          description={
            narrowed ? "Try another record type or action, or clear the filters." : "Actions across the platform will appear here."
          }
          action={
            narrowed ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={pathname}>Clear filters</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity", logs.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "entry" : "entries"}
          </p>
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`day-${group.key}`} className="flex flex-col gap-2">
              <h2 id={`day-${group.key}`} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h2>
              <ol className="flex flex-col gap-2">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <EntryCard entry={entry} state={state} hrefFor={hrefFor} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
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
