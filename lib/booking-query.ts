import { z } from "zod"

import type { BookingListQuery, BookingSortBy } from "@/types/booking"

export const BOOKINGS_PAGE_SIZE = 8

export const BOOKING_SORT_OPTIONS: { value: string; label: string; sortBy: BookingSortBy; sortOrder: "asc" | "desc" }[] = [
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "createdAt:asc", label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { value: "startDate:asc", label: "Starting soonest", sortBy: "startDate", sortOrder: "asc" },
  { value: "quantityKg:desc", label: "Largest quantity", sortBy: "quantityKg", sortOrder: "desc" },
]
export const DEFAULT_BOOKING_SORT = BOOKING_SORT_OPTIONS[0].value

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  status: optional(
    z.enum([
      "PENDING_APPROVAL",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
      "PAID",
      "STORED",
      "WITHDRAW_REQUESTED",
      "COMPLETED",
      "EXPIRED",
    ])
  ),
  sort: optional(z.enum(BOOKING_SORT_OPTIONS.map((o) => o.value) as [string, ...string[]])),
  page: optional(z.coerce.number().int().positive()),
})

export type BookingListState = z.infer<typeof schema>

export function parseBookingListState(params: URLSearchParams): BookingListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toBookingListQuery(state: BookingListState): BookingListQuery {
  const sort = BOOKING_SORT_OPTIONS.find((o) => o.value === (state.sort ?? DEFAULT_BOOKING_SORT)) ?? BOOKING_SORT_OPTIONS[0]
  return {
    ...(state.status ? { status: state.status } : {}),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: state.page ?? 1,
    limit: BOOKINGS_PAGE_SIZE,
  }
}

export function serializeBookingListState(state: BookingListState) {
  const params = new URLSearchParams()
  if (state.status) params.set("status", state.status)
  if (state.sort && state.sort !== DEFAULT_BOOKING_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
