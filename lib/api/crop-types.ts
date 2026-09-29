import { apiRequest } from "@/lib/api/client"
import { authedRequest } from "@/lib/api/authed"
import type { CropType } from "@/types/crop-type"

export type CropTypeListQuery = {
  search?: string
  sortBy?: "name" | "maxStorageDays" | "createdAt"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type CropTypePayload = Partial<Omit<CropType, "id">>

function toQueryString(query: CropTypeListQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const cropTypesApi = {
  list: (query: CropTypeListQuery, signal?: AbortSignal) =>
    apiRequest<CropType[]>(`/crop-types${toQueryString(query)}`, { signal }),
  create: (payload: CropTypePayload) => authedRequest<CropType>("/crop-types", { method: "POST", body: payload }),
  update: (id: string, payload: CropTypePayload) =>
    authedRequest<CropType>(`/crop-types/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => authedRequest<null>(`/crop-types/${id}`, { method: "DELETE" }),
}
