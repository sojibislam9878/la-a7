import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, SearchIcon, WarehouseIcon } from "lucide-react"

import { BookingForm } from "@/components/booking/booking-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { getCropTypes, getPublicWarehouse, getWarehouseChambers } from "@/lib/api/public-data"
import type { BookingFormValues } from "@/schemas/booking"

export const metadata: Metadata = { title: "New booking" }

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
const isIsoDate = (value: string | undefined): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value)

export default async function NewBookingPage({ searchParams }: PageProps) {
  const query = await searchParams
  const warehouseId = first(query.warehouseId)
  const warehouse = warehouseId ? await getPublicWarehouse(warehouseId) : null

  if (!warehouse) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="New booking" description="Start by picking a warehouse and checking its availability." />
        <EmptyState
          icon={WarehouseIcon}
          title="Choose a warehouse first"
          description="Find cold storage near you, check availability for your dates, then book from the warehouse page."
          action={
            <Button className="rounded-full" asChild>
              <Link href="/warehouses">
                <SearchIcon data-icon="inline-start" aria-hidden />
                Find storage
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const [chambers, cropTypes] = await Promise.all([
    getWarehouseChambers(warehouse.id).catch(() => []),
    getCropTypes().catch(() => []),
  ])

  const chamberId = first(query.chamberId)
  const cropTypeId = first(query.cropTypeId)
  const quantityKg = first(query.quantityKg)
  const startDate = first(query.startDate)
  const endDate = first(query.endDate)

  const defaults: Partial<BookingFormValues> = {
    chamberId: chambers.some((c) => c.id === chamberId) ? chamberId : undefined,
    cropTypeId: cropTypes.some((c) => c.id === cropTypeId) ? cropTypeId : undefined,
    quantityKg: quantityKg && /^\d+$/.test(quantityKg) ? quantityKg : undefined,
    startDate: isIsoDate(startDate) ? startDate : undefined,
    endDate: isIsoDate(endDate) ? endDate : undefined,
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit rounded-full text-muted-foreground" asChild>
          <Link href={`/warehouses/${warehouse.id}`}>
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            Back to {warehouse.name}
          </Link>
        </Button>
        <PageHeader
          title="Book cold storage"
          description="Confirm your chamber, crop, quantity and dates. The owner approves it, then you pay online."
        />
      </div>

      {warehouse.status !== "APPROVED" || chambers.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="This warehouse can't take bookings right now"
          description={
            warehouse.status !== "APPROVED"
              ? "It hasn't been approved by our team yet."
              : "It has no active chambers at the moment."
          }
          action={
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/warehouses">Find another warehouse</Link>
            </Button>
          }
        />
      ) : (
        <BookingForm warehouse={warehouse} chambers={chambers} cropTypes={cropTypes} defaults={defaults} />
      )}
    </div>
  )
}
