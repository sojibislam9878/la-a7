"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DISTRICTS } from "@/constants/districts"

export function DistrictSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  invalid,
  placeholder = "Choose a district",
}: {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  placeholder?: string
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange} name={name}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        onBlur={onBlur}
        className="h-10! w-full rounded-xl border-soil/15 bg-card text-left *:data-[slot=select-value]:grow"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        {DISTRICTS.map((district) => (
          <SelectItem key={district} value={district}>
            {district}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
