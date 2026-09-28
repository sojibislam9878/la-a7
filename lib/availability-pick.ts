import type { AvailabilitySelection } from "@/lib/availability-query"
import type { ChamberAvailabilitySummary, WarehouseAvailability } from "@/types/warehouse"

export function isChamberBookable(chamber: ChamberAvailabilitySummary, quantityKg?: number) {
  return chamber.fitsCrop !== false && chamber.availableKg > 0 && chamber.availableKg >= (quantityKg ?? 1)
}

export function pickChamber(result: WarehouseAvailability | undefined, selection: AvailabilitySelection) {
  if (!result) return undefined
  const chosen = result.chambers.find((chamber) => chamber.id === selection.chamber)
  if (chosen) return chosen
  return result.chambers.find((chamber) => isChamberBookable(chamber, selection.qty))
}
