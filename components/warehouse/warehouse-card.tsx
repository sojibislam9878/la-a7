import Link from "next/link"
import { BoxesIcon, CalendarClockIcon, DoorOpenIcon, type LucideIcon, MapPinIcon, StarIcon, WarehouseIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney, formatKg } from "@/lib/format"
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
        <dl className="flex flex-wrap gap-2 text-sm">
          <Stat icon={BoxesIcon} label="Total capacity" value={`${formatKg(warehouse.totalCapacityKg)} capacity`} />
          <Stat
            icon={DoorOpenIcon}
            label="Chambers"
            value={`${warehouse.chamberCount} ${warehouse.chamberCount === 1 ? "chamber" : "chambers"}`}
          />
          <Stat icon={CalendarClockIcon} label="Minimum booking" value={`Min ${warehouse.minBookingDays} days`} />
        </dl>
      </CardContent>

      <CardFooter className="mt-auto justify-between border-t">
        <p>
          <span className="text-xl font-bold">{formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 3 })}</span>
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

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 dark:bg-muted">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd className="whitespace-nowrap">{value}</dd>
    </div>
  )
}
