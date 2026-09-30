"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BoxesIcon,
  CalendarClockIcon,
  DoorOpenIcon,
  ExternalLinkIcon,
  type LucideIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SnowflakeIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

import { WarehouseFormDialog } from "@/components/owner/warehouses/warehouse-form-dialog"
import { WarehouseStatusBadge } from "@/components/owner/warehouses/warehouse-status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { WAREHOUSE_STATUS } from "@/constants/warehouse-status"
import { useDeleteWarehouse } from "@/hooks/use-owner-warehouses"
import { formatKg, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Warehouse } from "@/types/warehouse"

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-cream/60 px-3 py-2 dark:bg-muted/40">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold break-words">{value}</dd>
      </div>
    </div>
  )
}

export function OwnerWarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const remove = useDeleteWarehouse()
  const meta = WAREHOUSE_STATUS[warehouse.status]
  const rating =
    warehouse.avgRating === null || warehouse.reviewCount === 0
      ? "No reviews"
      : `${warehouse.avgRating.toFixed(1)} (${warehouse.reviewCount})`

  return (
    <article className="@container flex h-full flex-col gap-4 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <WarehouseStatusBadge status={warehouse.status} />
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <StarIcon
                className={cn("size-3.5", warehouse.reviewCount > 0 && "fill-amber-400 text-amber-400")}
                aria-hidden
              />
              {rating}
            </span>
          </div>
          <h2 className="font-display text-lg font-semibold">
            <Link href={`/owner/warehouses/${warehouse.id}`} className="hover:text-primary">
              {warehouse.name}
            </Link>
          </h2>
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="line-clamp-2">
              {warehouse.address}, {warehouse.district}
            </span>
          </p>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label={`Actions for ${warehouse.name}`}>
              <MoreHorizontalIcon aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => setEditing(true)}>
              <PencilIcon aria-hidden />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/owner/warehouses/${warehouse.id}`}>
                <SnowflakeIcon aria-hidden />
                Manage chambers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
              <Trash2Icon aria-hidden />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <p className={cn("rounded-xl px-3 py-2 text-xs font-medium", STATUS_TONE_CLASS[meta.tone])}>{meta.hint}</p>

      <dl className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
        <Stat
          icon={DoorOpenIcon}
          label="Active chambers"
          value={warehouse.chamberCount === 0 ? "None yet" : String(warehouse.chamberCount)}
        />
        <Stat icon={BoxesIcon} label="Capacity" value={formatKg(warehouse.totalCapacityKg)} />
        <Stat
          icon={SnowflakeIcon}
          label="Base rate"
          value={`${formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 4 })} /kg/day`}
        />
        <Stat icon={CalendarClockIcon} label="Minimum stay" value={`${warehouse.minBookingDays} days`} />
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button size="sm" className="rounded-full" asChild>
          <Link href={`/owner/warehouses/${warehouse.id}`}>
            <SnowflakeIcon data-icon="inline-start" aria-hidden />
            {warehouse.chamberCount === 0 ? "Add chambers" : "Manage chambers"}
          </Link>
        </Button>
        {warehouse.status === "APPROVED" && (
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <Link href={`/warehouses/${warehouse.id}`} target="_blank">
              <ExternalLinkIcon data-icon="inline-start" aria-hidden />
              View listing
            </Link>
          </Button>
        )}
      </div>

      <WarehouseFormDialog warehouse={warehouse} open={editing} onOpenChange={setEditing} />

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {warehouse.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing and {warehouse.chamberCount === 1 ? "its chamber" : `all ${warehouse.chamberCount} chambers`} will be
              removed. This is refused while any lot is paid for or still in storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep warehouse</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => remove.mutate({ id: warehouse.id, name: warehouse.name })}
            >
              Delete warehouse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
