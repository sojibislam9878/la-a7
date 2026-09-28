import "server-only"

import { env } from "@/lib/env"
import type { ApiResponse, Paginated } from "@/types/api"
import type { CropType } from "@/types/crop-type"
import type { Warehouse, WarehouseQuery } from "@/types/warehouse"

/**
 * Server-side reads of public (unauthenticated) endpoints, cached with ISR.
 * Authenticated requests go through the browser API client instead, because
 * the access token only lives in client memory.
 */
async function publicGet<T>(path: string, revalidate: number) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  })
  const body = (await res.json()) as ApiResponse<T>

  if (!body.success) {
    throw new Error(body.message)
  }
  return body
}

function toQueryString(query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function getPublicWarehouses(query: WarehouseQuery = {}): Promise<Paginated<Warehouse>> {
  const body = await publicGet<Warehouse[]>(`/warehouses${toQueryString(query)}`, 60)
  return {
    items: body.data,
    meta: body.meta ?? { page: 1, limit: body.data.length, total: body.data.length, totalPages: 1 },
  }
}

export async function getCropTypes(): Promise<CropType[]> {
  // Crop types are reference data (cached 24 h on the backend too)
  const body = await publicGet<CropType[]>("/crop-types", 3600)
  return body.data
}
