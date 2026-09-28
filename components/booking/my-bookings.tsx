"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AlertCircleIcon, ArrowUpDownIcon, CalendarPlusIcon, PlusIcon, RotateCwIcon } from "lucide-react"

import { BookingCard } from "@/components/booking/booking-card"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_FILTERS } from "@/constants/booking-status"
import { useMyBookings } from "@/hooks/use-bookings"
import { useNow } from "@/hooks/use-now"
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

export function MyBookings() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseBookingListState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toBookingListQuery(state), [state])
  const bookings = useMyBookings(query)
  const now = useNow()

  const hrefFor = (next: BookingListState) => {
    const qs = serializeBookingListState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }

  const data = bookings.data
  const filtered = !!state.status

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="My bookings"
        description="Track every lot from request to collection."
        actions={
          <Button className="rounded-full" asChild>
            <Link href="/warehouses">
              <PlusIcon data-icon="inline-start" aria-hidden />
              New booking
            </Link>
          </Button>
        }
      />

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 lg:flex-1">
          <ul className="flex w-max gap-1.5">
            {STATUS_FILTERS.map((filter) => {
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
          <AlertTitle>Couldn&apos;t load your bookings</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(bookings.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => bookings.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading bookings">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl sm:h-28" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={CalendarPlusIcon}
          title={filtered ? "No bookings with this status" : "You haven't booked any storage yet"}
          description={
            filtered
              ? "Try another status, or see all your bookings."
              : "Find a cold storage warehouse near you, check availability and send your first request."
          }
          action={
            <Button variant={filtered ? "outline" : "default"} className="rounded-full" asChild>
              <Link href={filtered ? pathname : "/warehouses"}>{filtered ? "Show all bookings" : "Find storage"}</Link>
            </Button>
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", bookings.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "booking" : "bookings"}
          </p>
          <ul className="flex flex-col gap-3">
            {data.items.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} now={now} />
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
