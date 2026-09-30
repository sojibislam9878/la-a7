"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowUpDownIcon, PlusIcon, RotateCwIcon, WarehouseIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { OwnerWarehouseCard } from "@/components/owner/warehouses/owner-warehouse-card"
import { WarehouseFormDialog } from "@/components/owner/warehouses/warehouse-form-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { WAREHOUSE_STATUS_FILTERS } from "@/constants/warehouse-status"
import { useMyWarehouses } from "@/hooks/use-owner-warehouses"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatNumber } from "@/lib/format"
import {
  DEFAULT_MY_WAREHOUSE_SORT,
  MY_WAREHOUSE_SORT_OPTIONS,
  type MyWarehouseListState,
  parseMyWarehouseListState,
  serializeMyWarehouseListState,
  toMyWarehouseListQuery,
} from "@/lib/owner-warehouse-query"
import { cn } from "@/lib/utils"

export function MyWarehouses() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseMyWarehouseListState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toMyWarehouseListQuery(state), [state])
  const warehouses = useMyWarehouses(query)
  const [adding, setAdding] = useState(false)

  const hrefFor = (next: MyWarehouseListState) => {
    const qs = serializeMyWarehouseListState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const data = warehouses.data
  const filtered = !!state.status

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="My warehouses"
        description="Your listings, their approval status, rates and chambers."
        actions={
          <Button className="rounded-full" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add warehouse
          </Button>
        }
      />
      <WarehouseFormDialog open={adding} onOpenChange={setAdding} />

      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label="Filter by status" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 xl:flex-1">
          <ul className="flex w-max gap-1.5">
            {WAREHOUSE_STATUS_FILTERS.map((filter) => {
              const active = (state.status ?? "ALL") === filter.value
              return (
                <li key={filter.value}>
                  <Link
                    href={hrefFor({ ...state, status: filter.value === "ALL" ? undefined : filter.value, page: undefined })}
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
                    {filter.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Select
          value={state.sort ?? DEFAULT_MY_WAREHOUSE_SORT}
          onValueChange={(sort) => router.replace(hrefFor({ ...state, sort, page: undefined }), { scroll: false })}
        >
          <SelectTrigger
            aria-label="Sort warehouses"
            className="h-10! w-full shrink-0 rounded-xl border-soil/15 bg-card text-left sm:w-48 *:data-[slot=select-value]:grow"
          >
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {MY_WAREHOUSE_SORT_OPTIONS.map((option) => (
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
          <AlertTitle>Couldn&apos;t load your warehouses</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(warehouses.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => warehouses.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="grid gap-4 2xl:grid-cols-2" aria-busy="true" aria-label="Loading warehouses">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title={filtered ? "No warehouses with this status" : "List your first warehouse"}
          description={
            filtered
              ? "Try another status, or see all your warehouses."
              : "Add its location, license and base rate. An admin reviews it, then farmers can book your chambers."
          }
          action={
            filtered ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={pathname}>Show all warehouses</Link>
              </Button>
            ) : (
              <Button className="rounded-full" onClick={() => setAdding(true)}>
                <PlusIcon data-icon="inline-start" aria-hidden />
                Add warehouse
              </Button>
            )
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", warehouses.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "warehouse" : "warehouses"}
          </p>
          <ul className="grid gap-4 2xl:grid-cols-2">
            {data.items.map((warehouse) => (
              <li key={warehouse.id}>
                <OwnerWarehouseCard warehouse={warehouse} />
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
