import Link from "next/link"
import { BoxesIcon, CalendarClockIcon, MapPinIcon, StarIcon, WarehouseIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatKg } from "@/lib/format"
import type { Warehouse } from "@/types/warehouse"

export function WarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  return (
    <Card className="group relative h-full transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WarehouseIcon className="size-5" aria-hidden />
          </span>
          <Rating avg={warehouse.avgRating} count={warehouse.reviewCount} />
        </div>
        <CardTitle className="text-lg">
          {/* Stretched link makes the whole card clickable while keeping one tab stop */}
          <Link
            href={`/warehouses/${warehouse.id}`}
            className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none"
          >
            {warehouse.name}
          </Link>
        </CardTitle>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {warehouse.address}, {warehouse.district}
          </span>
        </p>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <BoxesIcon className="size-4 text-muted-foreground" aria-hidden />
            <dt className="sr-only">Total capacity</dt>
            <dd>
              {formatKg(warehouse.totalCapacityKg)} · {warehouse.chamberCount}{" "}
              {warehouse.chamberCount === 1 ? "chamber" : "chambers"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClockIcon className="size-4 text-muted-foreground" aria-hidden />
            <dt className="sr-only">Minimum booking</dt>
            <dd>Min {warehouse.minBookingDays} days</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="mt-auto justify-between border-t">
        <p>
          <span className="text-xl font-bold">{formatBdt(warehouse.ratePerKgPerDay, { maximumFractionDigits: 3 })}</span>
          <span className="text-sm text-muted-foreground"> /kg/day</span>
        </p>
        <span className="text-sm font-medium text-primary group-hover:underline">View details</span>
      </CardFooter>
    </Card>
  )
}

function Rating({ avg, count }: { avg: number | null; count: number }) {
  if (avg === null || count === 0) {
    return <Badge variant="secondary">New</Badge>
  }
  return (
    <span className="flex items-center gap-1 text-sm font-medium">
      <StarIcon className="size-4 fill-amber-400 text-amber-400" aria-hidden />
      {avg.toFixed(1)}
      <span className="font-normal text-muted-foreground">({count})</span>
      <span className="sr-only">average rating from {count} reviews</span>
    </span>
  )
}
