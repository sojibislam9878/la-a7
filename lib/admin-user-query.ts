import { z } from "zod"

import type { AdminUserQuery } from "@/types/admin"

export const ADMIN_USERS_PAGE_SIZE = 10

export const ADMIN_USER_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "createdAt:asc", label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { value: "name:asc", label: "Name, A to Z", sortBy: "name", sortOrder: "asc" },
  { value: "email:asc", label: "Email, A to Z", sortBy: "email", sortOrder: "asc" },
] as const satisfies readonly {
  value: string
  label: string
  sortBy: NonNullable<AdminUserQuery["sortBy"]>
  sortOrder: "asc" | "desc"
}[]
export const DEFAULT_ADMIN_USER_SORT = ADMIN_USER_SORT_OPTIONS[0].value

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  q: optional(z.string().trim().min(1).max(80)),
  role: optional(z.enum(["FARMER", "WAREHOUSE_OWNER", "ADMIN"])),
  status: optional(z.enum(["ACTIVE", "BANNED"])),
  verified: optional(z.enum(["true", "false"])),
  deleted: optional(z.literal("1")),
  sort: optional(z.enum(ADMIN_USER_SORT_OPTIONS.map((o) => o.value) as [string, ...string[]])),
  page: optional(z.coerce.number().int().positive()),
})

export type AdminUserListState = z.infer<typeof schema>

export function parseAdminUserState(params: URLSearchParams): AdminUserListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  return schema.parse(record)
}

export function toAdminUserQuery(state: AdminUserListState): AdminUserQuery {
  const sort =
    ADMIN_USER_SORT_OPTIONS.find((o) => o.value === (state.sort ?? DEFAULT_ADMIN_USER_SORT)) ?? ADMIN_USER_SORT_OPTIONS[0]
  return {
    ...(state.q ? { search: state.q } : {}),
    ...(state.role ? { role: state.role } : {}),
    ...(state.status ? { status: state.status } : {}),
    ...(state.verified ? { verified: state.verified } : {}),
    ...(state.deleted ? { includeDeleted: "true" as const } : {}),
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: state.page ?? 1,
    limit: ADMIN_USERS_PAGE_SIZE,
  }
}

export function serializeAdminUserState(state: AdminUserListState) {
  const params = new URLSearchParams()
  if (state.q) params.set("q", state.q)
  if (state.role) params.set("role", state.role)
  if (state.status) params.set("status", state.status)
  if (state.verified) params.set("verified", state.verified)
  if (state.deleted) params.set("deleted", state.deleted)
  if (state.sort && state.sort !== DEFAULT_ADMIN_USER_SORT) params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
