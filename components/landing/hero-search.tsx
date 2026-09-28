import Form from "next/form"
import { MapPinIcon, SearchIcon, SproutIcon } from "lucide-react"

import { DISTRICTS } from "@/constants/districts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CropType } from "@/types/crop-type"

export function HeroSearch({ cropTypes }: { cropTypes: CropType[] }) {
  return (
    <Form
      action="/warehouses"
      className="grid w-full gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-primary/5 sm:grid-cols-[1fr_auto_auto_auto]"
    >
      <label className="relative flex items-center">
        <span className="sr-only">Search warehouses</span>
        <SearchIcon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden />
        <Input
          name="search"
          placeholder="Warehouse name or area"
          className="h-10 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </label>

      <Select name="district">
        <SelectTrigger aria-label="District" className="h-10! w-full sm:w-40">
          <MapPinIcon aria-hidden />
          <SelectValue placeholder="District" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-72">
          {DISTRICTS.map((district) => (
            <SelectItem key={district} value={district}>
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select name="cropTypeId">
        <SelectTrigger aria-label="Crop" className="h-10! w-full sm:w-40">
          <SproutIcon aria-hidden />
          <SelectValue placeholder="Crop" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-72">
          {cropTypes.map((crop) => (
            <SelectItem key={crop.id} value={crop.id}>
              {crop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" size="lg" className="h-10 px-5">
        <SearchIcon data-icon="inline-start" aria-hidden />
        Search
      </Button>
    </Form>
  )
}
