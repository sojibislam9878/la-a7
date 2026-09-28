import { Skeleton } from "@/components/ui/skeleton"
import { WarehouseResultsSkeleton } from "@/components/warehouse/warehouse-results"

/** Instant navigation feedback while the search page renders on the server */
export default function WarehousesLoading() {
  return (
    <>
      <section className="border-b border-soil/10 bg-cream bg-grain">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <Skeleton className="hidden h-[34rem] rounded-3xl lg:block" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-11 rounded-xl" />
          <WarehouseResultsSkeleton />
        </div>
      </div>
    </>
  )
}
