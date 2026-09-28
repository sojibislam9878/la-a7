import { Skeleton } from "@/components/ui/skeleton"

export default function WarehouseDetailLoading() {
  return (
    <>
      <section className="border-b border-soil/10 bg-cream bg-grain">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Skeleton className="h-4 w-64" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-12 w-full max-w-lg" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8 lg:py-12">
        <Skeleton className="h-[28rem] rounded-3xl lg:order-2" />
        <div className="flex flex-col gap-4 lg:order-1">
          <Skeleton className="h-8 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </>
  )
}
