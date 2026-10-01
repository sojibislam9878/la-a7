import Link from "next/link"
import {
  BadgeCheckIcon,
  BanknoteIcon,
  BoxesIcon,
  CalendarClockIcon,
  ChevronRightIcon,
  DoorOpenIcon,
  FileBadgeIcon,
  MapPinIcon,
  StarIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Leaf } from "@/components/shared/leaf"
import { formatKg, formatMoney } from "@/lib/format"
import type { WarehouseDetail, WarehouseStatus } from "@/types/warehouse"

const STATUS_NOTICE: Record<Exclude<WarehouseStatus, "APPROVED">, string> = {
  PENDING: "This warehouse is waiting for admin approval and can't take bookings yet.",
  REJECTED: "This warehouse was not approved and can't take bookings.",
  SUSPENDED: "This warehouse is suspended and isn't taking bookings right now.",
}

export function WarehouseHero({ warehouse }: { warehouse: WarehouseDetail }) {
  const facts = [
    {
      icon: BanknoteIcon,
      label: "Rate",
      value: formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 3 }),
      hint: "per kg per day",
    },
    { icon: CalendarClockIcon, label: "Minimum booking", value: `${warehouse.minBookingDays} days`, hint: "shorter stays pay the minimum" },
    { icon: BoxesIcon, label: "Total capacity", value: formatKg(warehouse.totalCapacityKg), hint: "across active chambers" },
    {
      icon: DoorOpenIcon,
      label: "Chambers",
      value: String(warehouse.chamberCount),
      hint: warehouse.chamberCount === 1 ? "temperature zone" : "temperature zones",
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-soil/10 bg-cream bg-grain">
      <Leaf className="absolute top-8 right-[6%] size-24 rotate-12 text-primary/15" />
      <Leaf className="absolute -bottom-6 left-[40%] size-16 -rotate-[30deg] text-harvest/30" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
              <Link href="/warehouses" className="hover:text-foreground">
                Find storage
              </Link>
              <ChevronRightIcon className="size-3.5" aria-hidden />
            </li>
            <li className="flex shrink-0 items-center gap-1.5">
              <Link href={`/warehouses?district=${encodeURIComponent(warehouse.district)}`} className="hover:text-foreground">
                {warehouse.district}
              </Link>
              <ChevronRightIcon className="size-3.5" aria-hidden />
            </li>
            <li aria-current="page" className="min-w-0 truncate text-foreground">
              {warehouse.name}
            </li>
          </ol>
        </nav>

        {warehouse.status !== "APPROVED" && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-harvest/40 bg-harvest/15 px-4 py-3 text-sm"
          >
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-harvest-foreground dark:text-harvest" aria-hidden />
            {STATUS_NOTICE[warehouse.status]}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {warehouse.status === "APPROVED" && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheckIcon className="size-3.5" aria-hidden />
                Verified warehouse
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
              <FileBadgeIcon className="size-3.5" aria-hidden />
              License {warehouse.licenseNo}
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{warehouse.name}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-4" aria-hidden />
              {warehouse.address}, {warehouse.district}
            </span>
            {warehouse.avgRating !== null && warehouse.reviewCount > 0 ? (
              <a href="#reviews" className="flex items-center gap-1.5 hover:text-foreground">
                <StarIcon className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                <span className="font-semibold text-foreground">{warehouse.avgRating.toFixed(1)}</span>
                <span>
                  ({warehouse.reviewCount} {warehouse.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5">
                <StarIcon className="size-4" aria-hidden />
                No reviews yet
              </span>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-soil/10 bg-card/80 p-4 backdrop-blur">
              <dt className="text-xs font-medium text-muted-foreground">{fact.label}</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight">{fact.value}</dd>
              <dd className="text-xs text-muted-foreground">{fact.hint}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
