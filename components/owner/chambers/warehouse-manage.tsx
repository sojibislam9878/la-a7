"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { addDays, format } from "date-fns"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BoxesIcon,
  CalendarClockIcon,
  DoorOpenIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RotateCwIcon,
  SearchXIcon,
  SnowflakeIcon,
  TagIcon,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { ChamberCard } from "@/components/owner/chambers/chamber-card"
import { ChamberFormDialog } from "@/components/owner/chambers/chamber-form-dialog"
import { WarehouseFormDialog } from "@/components/owner/warehouses/warehouse-form-dialog"
import { WarehouseStatusBadge } from "@/components/owner/warehouses/warehouse-status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { WAREHOUSE_STATUS } from "@/constants/warehouse-status"
import { useWarehouseAvailability } from "@/hooks/use-availability"
import { useWarehouseChambers } from "@/hooks/use-chambers"
import { useOwnerWarehouse } from "@/hooks/use-owner-warehouses"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatKg, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { CropType } from "@/types/crop-type"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LOAD_WINDOW_DAYS = 30

function NotFound() {
  return (
    <EmptyState
      icon={SearchXIcon}
      title="Warehouse not found"
      description="It may have been deleted, or it belongs to another owner."
      action={
        <Button className="rounded-full" asChild>
          <Link href="/owner/warehouses">Back to my warehouses</Link>
        </Button>
      }
    />
  )
}

export function WarehouseManage({ id, cropTypes }: { id: string; cropTypes: CropType[] }) {
  if (!UUID.test(id)) return <NotFound />
  return <WarehouseManageView id={id} cropTypes={cropTypes} />
}

function WarehouseManageView({ id, cropTypes }: { id: string; cropTypes: CropType[] }) {
  const userId = useAuthStore((state) => state.user?.id)
  const warehouse = useOwnerWarehouse(id)
  const chambers = useWarehouseChambers(id)
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [today] = useState(() => new Date())
  const params = useMemo(
    () => ({
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, LOAD_WINDOW_DAYS - 1), "yyyy-MM-dd"),
    }),
    [today]
  )
  const availability = useWarehouseAvailability(id, warehouse.data ? params : null)

  if (warehouse.isError) {
    if (warehouse.error instanceof ApiError && warehouse.error.status === 404) return <NotFound />
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Couldn&apos;t load this warehouse</AlertTitle>
        <AlertDescription>
          <p>{getErrorMessage(warehouse.error)}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => warehouse.refetch()}>
            <RotateCwIcon data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const data = warehouse.data
  if (!data) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading warehouse">
        <Skeleton className="h-24 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    )
  }
  if (userId && data.owner.id !== userId) return <NotFound />

  const meta = WAREHOUSE_STATUS[data.status]
  const list = chambers.data ?? []
  const active = list.filter((chamber) => chamber.isActive)
  const loads = new Map(availability.data?.chambers.map((chamber) => [chamber.id, chamber]))

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit rounded-full text-muted-foreground" asChild>
          <Link href="/owner/warehouses">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            My warehouses
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{data.name}</h1>
              <WarehouseStatusBadge status={data.status} />
            </div>
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {data.address}, {data.district} · License {data.licenseNo}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditing(true)}>
              <PencilIcon data-icon="inline-start" aria-hidden />
              Edit details
            </Button>
            {data.status === "APPROVED" && (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href={`/warehouses/${data.id}`} target="_blank">
                  <ExternalLinkIcon data-icon="inline-start" aria-hidden />
                  View listing
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className={cn("rounded-2xl px-4 py-3 text-sm font-medium", STATUS_TONE_CLASS[meta.tone])}>{meta.hint}</p>

      <section aria-label="Warehouse summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Active chambers"
          value={chambers.data ? `${active.length} of ${list.length}` : "…"}
          icon={DoorOpenIcon}
          tone="sky"
        />
        <StatCard
          label="Bookable capacity"
          value={chambers.data ? formatKg(active.reduce((sum, chamber) => sum + chamber.capacityKg, 0)) : "…"}
          icon={BoxesIcon}
        />
        <StatCard
          label="Base rate"
          value={formatMoney(data.ratePerKgPerDay, { maximumFractionDigits: 4 })}
          hint="per kg per day"
          icon={TagIcon}
          tone="harvest"
        />
        <StatCard label="Minimum stay" value={`${data.minBookingDays} days`} icon={CalendarClockIcon} tone="soil" />
      </section>

      <section aria-labelledby="chambers-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="chambers-heading" className="font-display text-xl font-semibold">
              Chambers
            </h2>
            <p className="text-sm text-muted-foreground">
              Each chamber holds crops whose ideal temperature fits inside its range.
            </p>
          </div>
          <Button className="rounded-full" onClick={() => setAdding(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add chamber
          </Button>
        </div>

        {chambers.isError ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Couldn&apos;t load chambers</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(chambers.error)}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => chambers.refetch()}>
                <RotateCwIcon data-icon="inline-start" aria-hidden />
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : !chambers.data ? (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading chambers">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-60 rounded-3xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={SnowflakeIcon}
            title="No chambers yet"
            description="Add a chamber with its capacity and temperature range. Farmers book space chamber by chamber."
            action={
              <Button className="rounded-full" onClick={() => setAdding(true)}>
                <PlusIcon data-icon="inline-start" aria-hidden />
                Add your first chamber
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {list.map((chamber) => (
              <li key={chamber.id} className="flex">
                <ChamberCard
                  warehouseId={id}
                  chamber={chamber}
                  cropTypes={cropTypes}
                  load={loads.get(chamber.id)}
                  loadLoading={availability.isPending && !availability.isError}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <WarehouseFormDialog warehouse={data} open={editing} onOpenChange={setEditing} />
      <ChamberFormDialog warehouseId={id} cropTypes={cropTypes} open={adding} onOpenChange={setAdding} />
    </div>
  )
}
