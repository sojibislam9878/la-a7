"use client"

import { useEffect, useState } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 400

export function UrlSearchInput({
  id,
  urlValue,
  onCommit,
  label,
  placeholder,
  className,
}: {
  id: string
  urlValue: string
  onCommit: (value: string) => void
  label: string
  placeholder: string
  className?: string
}) {
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
      onCommit(next)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, urlValue, onCommit])

  return (
    <div role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-xl border-soil/15 bg-card pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
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
