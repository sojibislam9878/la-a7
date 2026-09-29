"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowUpDownIcon, InboxIcon, RotateCwIcon, WarehouseIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { OwnerBookingCard } from "@/components/owner/bookings/owner-booking-card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useNow } from "@/hooks/use-now"
import { useWarehouseBookings } from "@/hooks/use-owner-bookings"
import { useMyWarehouses } from "@/hooks/use-owner-warehouses"
import { getErrorMessage } from "@/lib/api/form-errors"
import {
  BOOKING_SORT_OPTIONS,
  type BookingListState,
  DEFAULT_BOOKING_SORT,
  parseBookingListState,
  serializeBookingListState,
  toBookingListQuery,
} from "@/lib/booking-query"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BookingStatus } from "@/types/booking"

const OWNER_FILTERS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_APPROVAL", label: "New requests" },
  { value: "APPROVED", label: "Awaiting payment" },
  { value: "PAID", label: "Arriving" },
  { value: "STORED", label: "In storage" },
  { value: "WITHDRAW_REQUESTED", label: "Withdrawals" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
]

const ALL_WAREHOUSES_QUERY = { sortBy: "name", sortOrder: "asc", page: 1, limit: 100 } as const
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function BookingQueue() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseBookingListState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toBookingListQuery(state), [state])
  const requested = searchParams.get("warehouse")
  const warehouses = useMyWarehouses(ALL_WAREHOUSES_QUERY)
  const list = warehouses.data?.items ?? []
  const selected = list.find((warehouse) => warehouse.id === requested) ?? list[0] ?? null
  const bookings = useWarehouseBookings(selected?.id ?? null, query)
  const now = useNow()

  const hrefFor = (next: BookingListState, warehouseId = selected?.id) => {
    const params = new URLSearchParams(serializeBookingListState(next))
    if (warehouseId && warehouseId !== list[0]?.id) params.set("warehouse", warehouseId)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const header = (
    <PageHeader title="Booking requests" description="Approve new requests, receive paid lots and release them when farmers collect." />
  )

  if (warehouses.isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
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
      </div>
    )
  }

  if (warehouses.data && list.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          icon={WarehouseIcon}
          title="No warehouses yet"
          description="Booking requests arrive here once you list a warehouse and add chambers."
          action={
            <Button className="rounded-full" asChild>
              <Link href="/owner/warehouses">Add a warehouse</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const data = bookings.data
  const filtered = !!state.status
  const invalidRequested = !!requested && (!UUID.test(requested) || (warehouses.data && !list.some((w) => w.id === requested)))

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {header}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {selected ? (
          <Select
            value={selected.id}
            onValueChange={(id) => router.replace(hrefFor({ ...state, page: undefined }, id), { scroll: false })}
          >
            <SelectTrigger
              aria-label="Warehouse"
              className="h-11! w-full rounded-xl border-soil/15 bg-card text-left font-medium sm:w-80 *:data-[slot=select-value]:grow"
            >
              <WarehouseIcon aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {list.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Skeleton className="h-11 w-full rounded-xl sm:w-80" />
        )}
        {invalidRequested && (
          <p className="text-sm text-muted-foreground">That warehouse wasn&apos;t found, showing {selected?.name}.</p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 lg:flex-1">
          <ul className="flex w-max gap-1.5">
            {OWNER_FILTERS.map((filter) => {
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
          value={state.sort ?? DEFAULT_BOOKING_SORT}
          onValueChange={(sort) => router.replace(hrefFor({ ...state, sort, page: undefined }), { scroll: false })}
        >
          <SelectTrigger
            aria-label="Sort bookings"
            className="h-10! w-full shrink-0 rounded-xl border-soil/15 bg-card text-left sm:w-52 *:data-[slot=select-value]:grow"
          >
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {BOOKING_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {bookings.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load booking requests</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(bookings.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => bookings.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data || !now ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading booking requests">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={filtered ? "Nothing with this status" : "No booking requests yet"}
          description={
            filtered
              ? "Try another status, or see every booking for this warehouse."
              : "Requests appear here as soon as farmers book one of your active chambers."
          }
          action={
            filtered ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={hrefFor({ ...state, status: undefined, page: undefined })}>Show all bookings</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", bookings.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "booking" : "bookings"} at {selected?.name}
          </p>
          <ul className="flex flex-col gap-3">
            {data.items.map((booking) => (
              <li key={booking.id}>
                <OwnerBookingCard booking={booking} now={now} />
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
