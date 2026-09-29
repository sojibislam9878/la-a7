"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { AlertCircleIcon, MapPinIcon, MessageSquareQuoteIcon, RotateCwIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { BookingReview } from "@/components/review/booking-review"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyBookings } from "@/hooks/use-bookings"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Booking, BookingListQuery } from "@/types/booking"

const REVIEWS_PAGE_SIZE = 6

function pageFrom(params: URLSearchParams) {
  const page = Number(params.get("page"))
  return Number.isInteger(page) && page > 0 ? page : 1
}

export function MyReviews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = pageFrom(searchParams)
  const query = useMemo<BookingListQuery>(
    () => ({ status: "COMPLETED", sortBy: "endDate", sortOrder: "desc", page, limit: REVIEWS_PAGE_SIZE }),
    [page]
  )
  const bookings = useMyBookings(query)
  const data = bookings.data

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="My reviews"
        description="Rate the warehouses where you completed a booking. Reviews are public and help other farmers choose."
      />

      {bookings.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load your completed bookings</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(bookings.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => bookings.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="grid gap-4 xl:grid-cols-2" aria-busy="true" aria-label="Loading reviews">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuoteIcon}
          title="Nothing to review yet"
          description="Once a lot is collected and the bill is settled, you can rate that warehouse here."
          action={
            <Button className="rounded-full" asChild>
              <Link href="/farmer/bookings">Go to my bookings</Link>
            </Button>
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", bookings.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} completed {data.meta.total === 1 ? "stay" : "stays"}
          </p>
          <ul className="grid gap-4 xl:grid-cols-2">
            {data.items.map((booking) => (
              <li key={booking.id}>
                <ReviewCard booking={booking} />
              </li>
            ))}
          </ul>
          <PageLinks
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            hrefFor={(next) => (next > 1 ? `${pathname}?page=${next}` : pathname)}
            scroll={false}
          />
        </div>
      )}
    </div>
  )
}

function ReviewCard({ booking }: { booking: Booking }) {
  const reviewed = booking.review ? true : booking.review === null ? false : null

  return (
    <article className="flex h-full flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">
            <Link href={`/warehouses/${booking.warehouse.id}`} className="hover:text-primary">
              {booking.warehouse.name}
            </Link>
          </h2>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" aria-hidden />
              {booking.warehouse.district}
            </span>
            <span aria-hidden>·</span>
            <Link href={`/farmer/bookings/${booking.id}`} className="font-mono hover:text-foreground">
              {booking.lotCode}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.cropType.name}, {format(parseISO(booking.startDate), "MMM d")} to{" "}
            {format(parseISO(booking.endDate), "MMM d, yyyy")}
          </p>
        </div>
        {reviewed !== null && (
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold",
              reviewed ? "bg-primary/15 text-primary" : "bg-harvest/20 text-harvest-foreground dark:text-harvest"
            )}
          >
            {reviewed ? "Reviewed" : "Awaiting your review"}
          </span>
        )}
      </header>
      <BookingReview booking={booking} />
    </article>
  )
}
