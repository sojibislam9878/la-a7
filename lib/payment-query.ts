import { z } from "zod"

import type { PaymentListQuery } from "@/types/payment"

export const PAYMENTS_PAGE_SIZE = 10

export const PAYMENT_SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
] as const
export const DEFAULT_PAYMENT_SORT = "desc"

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  status: optional(z.enum(["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"])),
  sort: optional(z.enum(["asc", "desc"])),
  page: optional(z.coerce.number().int().positive()),
})

export type PaymentListState = z.infer<typeof schema>

export function parsePaymentListState(params: URLSearchParams): PaymentListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toPaymentListQuery(state: PaymentListState): PaymentListQuery {
  return {
    ...(state.status ? { status: state.status } : {}),
    sortOrder: state.sort ?? DEFAULT_PAYMENT_SORT,
    page: state.page ?? 1,
    limit: PAYMENTS_PAGE_SIZE,
  }
}

export function serializePaymentListState(state: PaymentListState) {
  const params = new URLSearchParams()
  if (state.status) params.set("status", state.status)
  if (state.sort && state.sort !== DEFAULT_PAYMENT_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
