import { z } from "zod"

import type { InspectionQuery } from "@/types/admin"

export const INSPECTIONS_PAGE_SIZE = 10

export const INSPECTION_SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
] as const
export const DEFAULT_INSPECTION_SORT = "desc"

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  grade: optional(z.enum(["A", "B", "C", "REJECTED"])),
  sort: optional(z.enum(["asc", "desc"])),
  page: optional(z.coerce.number().int().positive()),
})

export type InspectionListState = z.infer<typeof schema>

export function parseInspectionState(params: URLSearchParams): InspectionListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toInspectionQuery(state: InspectionListState): InspectionQuery {
  return {
    ...(state.grade ? { grade: state.grade } : {}),
    sortOrder: state.sort ?? DEFAULT_INSPECTION_SORT,
    page: state.page ?? 1,
    limit: INSPECTIONS_PAGE_SIZE,
  }
}

export function serializeInspectionState(state: InspectionListState) {
  const params = new URLSearchParams()
  if (state.grade) params.set("grade", state.grade)
  if (state.sort && state.sort !== DEFAULT_INSPECTION_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
