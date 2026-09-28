import "server-only"

import { env } from "@/lib/env"
import type { ApiResponse, Paginated } from "@/types/api"
import type { CropType } from "@/types/crop-type"
import type { Chamber, Review, Warehouse, WarehouseDetail, WarehouseQuery } from "@/types/warehouse"

export class PublicApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "PublicApiError"
    this.status = status
  }
}

async function publicGet<T>(path: string, revalidate: number) {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  })
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null

  if (!body) {
    throw new PublicApiError(res.status, `Unexpected response from the server (${res.status}).`)
  }
  if (!body.success) {
    throw new PublicApiError(res.status, body.message)
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

function toPaginated<T>(body: { data: T[]; meta?: Paginated<T>["meta"] }): Paginated<T> {
  return {
    items: body.data,
    meta: body.meta ?? { page: 1, limit: body.data.length, total: body.data.length, totalPages: 1 },
  }
}

export async function getPublicWarehouses(query: WarehouseQuery = {}): Promise<Paginated<Warehouse>> {
  return toPaginated(await publicGet<Warehouse[]>(`/warehouses${toQueryString(query)}`, 60))
}

export async function getPublicWarehouse(id: string): Promise<WarehouseDetail | null> {
  try {
    return (await publicGet<WarehouseDetail>(`/warehouses/${encodeURIComponent(id)}`, 300)).data
  } catch (error) {
    if (error instanceof PublicApiError && (error.status === 404 || error.status === 400)) return null
    throw error
  }
}

export async function getWarehouseChambers(warehouseId: string): Promise<Chamber[]> {
  const body = await publicGet<Chamber[]>(`/warehouses/${encodeURIComponent(warehouseId)}/chambers?isActive=true`, 300)
  return body.data
}

export async function getWarehouseReviews(warehouseId: string, page = 1, limit = 5): Promise<Paginated<Review>> {
  return toPaginated(
    await publicGet<Review[]>(`/warehouses/${encodeURIComponent(warehouseId)}/reviews${toQueryString({ page, limit })}`, 300)
  )
}

export async function getCropTypes(): Promise<CropType[]> {
  const body = await publicGet<CropType[]>("/crop-types", 3600)
  return body.data
}
