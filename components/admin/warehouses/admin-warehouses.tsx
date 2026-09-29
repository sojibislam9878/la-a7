"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowUpDownIcon, RotateCwIcon, WarehouseIcon, XIcon } from "lucide-react"

import { AdminWarehouseCard } from "@/components/admin/warehouses/admin-warehouse-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { UrlSearchInput } from "@/components/shared/url-search-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DISTRICTS } from "@/constants/districts"
import { useAdminWarehouses } from "@/hooks/use-admin-warehouses"
import { getErrorMessage } from "@/lib/api/form-errors"
import {
  ADMIN_WAREHOUSE_SORT_OPTIONS,
  type AdminWarehouseListState,
  currentStatus,
  DEFAULT_ADMIN_WAREHOUSE_SORT,
  parseAdminWarehouseState,
  serializeAdminWarehouseState,
  toAdminWarehouseQuery,
} from "@/lib/admin-warehouse-query"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const TABS: { value: NonNullable<AdminWarehouseListState["status"]>; label: string }[] = [
  { value: "PENDING", label: "Under review" },
  { value: "APPROVED", label: "Live" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
]

const ANY = "any"

export function AdminWarehouses() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseAdminWarehouseState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toAdminWarehouseQuery(state), [state])
  const warehouses = useAdminWarehouses(query)
  const status = currentStatus(state)

  const hrefFor = (next: AdminWarehouseListState) => {
    const qs = serializeAdminWarehouseState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const commitSearch = useCallback(
    (q: string) => {
      const next = { ...parseAdminWarehouseState(new URLSearchParams(current)), q: q || undefined, page: undefined }
      const qs = serializeAdminWarehouseState(next)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [current, pathname, router]
  )

  const data = warehouses.data
  const narrowed = !!state.q || !!state.district

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Warehouse review"
        description="Verify new listings against the owner's business details, and suspend listings that stop meeting the rules."
      />

      <nav aria-label="Filter by status" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-1.5">
          {TABS.map((tab) => {
            const active = status === tab.value
            return (
              <li key={tab.value}>
                <Link
                  href={hrefFor({ ...state, status: tab.value, page: undefined })}
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
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <UrlSearchInput
          id="admin-warehouse-search"
          urlValue={state.q ?? ""}
          onCommit={commitSearch}
          label="Search warehouses by name, address, license or owner"
          placeholder="Search name, address, license or owner"
        />
        <Select
          value={state.district ?? ANY}
          onValueChange={(value) =>
            router.replace(
              hrefFor({ ...state, district: value === ANY ? undefined : (value as AdminWarehouseListState["district"]), page: undefined }),
              { scroll: false }
            )
          }
        >
          <SelectTrigger
            aria-label="District"
            className="h-10! w-full rounded-xl border-soil/15 bg-card text-left *:data-[slot=select-value]:grow"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-72">
            <SelectItem value={ANY}>Any district</SelectItem>
            {DISTRICTS.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={state.sort ?? DEFAULT_ADMIN_WAREHOUSE_SORT}
          onValueChange={(sort) => router.replace(hrefFor({ ...state, sort, page: undefined }), { scroll: false })}
        >
          <SelectTrigger
            aria-label="Sort warehouses"
            className="h-10! w-full rounded-xl border-soil/15 bg-card text-left *:data-[slot=select-value]:grow"
          >
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {ADMIN_WAREHOUSE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {warehouses.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load warehouses</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(warehouses.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => warehouses.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading warehouses">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title={
            narrowed
              ? "No warehouses match"
              : status === "PENDING"
                ? "Review queue is clear"
                : "No warehouses with this status"
          }
          description={
            narrowed
              ? "Try another search or district."
              : status === "PENDING"
                ? "New listings from owners appear here for approval."
                : "Pick another status to see more listings."
          }
          action={
            narrowed ? (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  router.replace(hrefFor({ ...state, q: undefined, district: undefined, page: undefined }), { scroll: false })
                }
              >
                <XIcon data-icon="inline-start" aria-hidden />
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", warehouses.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "warehouse" : "warehouses"}
          </p>
          <ul className="flex flex-col gap-4">
            {data.items.map((warehouse) => (
              <li key={warehouse.id}>
                <AdminWarehouseCard warehouse={warehouse} />
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
