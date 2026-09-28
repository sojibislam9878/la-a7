"use client"

import { useState } from "react"
import { SlidersHorizontalIcon } from "lucide-react"

import { FilterPanel } from "@/components/warehouse/filter-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useWarehouseQuery } from "@/hooks/use-warehouse-query"
import { countActiveFilters } from "@/lib/warehouse-query"
import type { CropType } from "@/types/crop-type"

export function MobileFilters({ cropTypes }: { cropTypes: CropType[] }) {
  const [open, setOpen] = useState(false)
  const { query } = useWarehouseQuery()
  const activeCount = countActiveFilters(query)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-11 rounded-xl border-soil/15 bg-card lg:hidden">
          <SlidersHorizontalIcon data-icon="inline-start" aria-hidden />
          Filters
          {activeCount > 0 && (
            <Badge className="ml-0.5 size-5 justify-center rounded-full p-0">{activeCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 bg-cream">
        <SheetHeader className="sr-only">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down warehouses by location, crop, size, price and rating.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 pt-12 pb-4">
          <FilterPanel cropTypes={cropTypes} />
        </div>
        <SheetFooter className="border-t">
          <Button size="lg" className="rounded-full" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
