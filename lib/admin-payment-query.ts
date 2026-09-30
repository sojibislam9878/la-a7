import { z } from "zod"

import type { AdminPaymentQuery } from "@/types/admin"

export const ADMIN_PAYMENTS_PAGE_SIZE = 10

export const ADMIN_PAYMENT_VIEWS = [
  { value: "ALL", label: "All" },
  { value: "REFUND_DUE", label: "Refund due" },
  { value: "SUCCEEDED", label: "Paid" },
  { value: "PENDING", label: "Processing" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
] as const

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  view: optional(z.enum(["REFUND_DUE", "SUCCEEDED", "PENDING", "REFUNDED", "FAILED"])),
  q: optional(z.string().trim().min(1).max(80)),
  sort: optional(z.enum(["asc", "desc"])),
  page: optional(z.coerce.number().int().positive()),
})

export type AdminPaymentListState = z.infer<typeof schema>

export function parseAdminPaymentState(params: URLSearchParams): AdminPaymentListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toAdminPaymentQuery(state: AdminPaymentListState): AdminPaymentQuery {
  return {
    ...(state.view === "REFUND_DUE" ? { refundDue: "true" as const } : state.view ? { status: state.view } : {}),
    ...(state.q ? { search: state.q } : {}),
    sortOrder: state.sort ?? "desc",
    page: state.page ?? 1,
    limit: ADMIN_PAYMENTS_PAGE_SIZE,
  }
}

export function serializeAdminPaymentState(state: AdminPaymentListState) {
  const params = new URLSearchParams()
  if (state.view) params.set("view", state.view)
  if (state.q) params.set("q", state.q)
  if (state.sort && state.sort !== "desc") params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
