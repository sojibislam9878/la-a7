import { SproutIcon } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"

/** Temporary body for dashboard sections that are planned but not built yet */
export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-soil/15 bg-cream/40 px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-[58%_42%_52%_48%/55%_48%_52%_45%] bg-primary/15 text-primary">
          <SproutIcon className="size-6" aria-hidden />
        </span>
        <p className="font-semibold">This section is growing</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          It&apos;s planned and will be available soon.
        </p>
      </div>
    </div>
  )
}
