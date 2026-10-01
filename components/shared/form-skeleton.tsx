import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      ))}
      <Skeleton className="ml-auto h-10 w-36 rounded-full" />
    </div>
  )
}
