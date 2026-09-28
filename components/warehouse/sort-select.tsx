"use client"

import { ArrowUpDownIcon } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWarehouseQuery } from "@/hooks/use-warehouse-query"
import { DEFAULT_SORT, SORT_OPTIONS } from "@/lib/warehouse-query"

export function SortSelect() {
  const { query, update } = useWarehouseQuery()
  const current =
    SORT_OPTIONS.find((option) => option.sortBy === query.sortBy && option.sortOrder === query.sortOrder)?.value ??
    DEFAULT_SORT

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const option = SORT_OPTIONS.find((o) => o.value === value)
        if (option) update({ sortBy: option.sortBy, sortOrder: option.sortOrder })
      }}
    >
      <SelectTrigger aria-label="Sort warehouses" className="h-11! w-full rounded-xl border-soil/15 bg-card text-left sm:w-52 *:data-[slot=select-value]:grow">
        <ArrowUpDownIcon aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" position="popper">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
