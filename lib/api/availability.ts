import { apiRequest } from "@/lib/api/client"
import type { ChamberAvailability, WarehouseAvailability } from "@/types/warehouse"

export type AvailabilityParams = {
  startDate: string
  endDate: string
  cropTypeId?: string
}

function toQuery({ startDate, endDate, cropTypeId }: AvailabilityParams) {
  const params = new URLSearchParams({ startDate, endDate })
  if (cropTypeId) params.set("cropTypeId", cropTypeId)
  return params.toString()
}

export const availabilityApi = {
  warehouse: (warehouseId: string, params: AvailabilityParams, signal?: AbortSignal) =>
    apiRequest<WarehouseAvailability>(`/warehouses/${warehouseId}/availability?${toQuery(params)}`, { signal }),

  chamber: (chamberId: string, params: AvailabilityParams, signal?: AbortSignal) =>
    apiRequest<ChamberAvailability>(`/chambers/${chamberId}/availability?${toQuery(params)}`, { signal }),
}
