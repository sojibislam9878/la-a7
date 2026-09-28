"use client"

import { useEffect, useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWarehouseQuery } from "@/hooks/use-warehouse-query"

const DEBOUNCE_MS = 400

export function SearchInput() {
  const { query, update } = useWarehouseQuery()
  const urlValue = query.search ?? ""

  const [value, setValue] = useState(urlValue)
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue)
  const [pushedValue, setPushedValue] = useState(urlValue)

  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue)
    if (urlValue !== pushedValue) setValue(urlValue)
  }

  useEffect(() => {
    const next = value.trim()
    if (next === urlValue) return
    const timer = setTimeout(() => {
      setPushedValue(next)
      update({ search: next || undefined })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, urlValue, update])

  return (
    <div role="search" className="relative flex-1">
      <label htmlFor="warehouse-search" className="sr-only">
        Search warehouses by name or address
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id="warehouse-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search name or address"
        className="h-11 rounded-xl border-soil/15 bg-card pr-10 pl-10 text-base md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg text-muted-foreground"
          onClick={() => setValue("")}
          aria-label="Clear search"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}
