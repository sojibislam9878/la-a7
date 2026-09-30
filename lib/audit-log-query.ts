import { z } from "zod"

import { AUDIT_ACTION, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit-log"
import type { AuditLogQuery } from "@/types/admin"

export const AUDIT_LOGS_PAGE_SIZE = 20

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const schema = z.object({
  type: optional(z.enum(AUDIT_ENTITY_TYPES)),
  action: optional(z.enum(AUDIT_ACTIONS as [string, ...string[]])),
  actor: optional(z.uuid()),
  entity: optional(z.uuid()),
  sort: optional(z.enum(["asc", "desc"])),
  page: optional(z.coerce.number().int().positive()),
})

export type AuditLogListState = z.infer<typeof schema>

export function parseAuditLogState(params: URLSearchParams): AuditLogListState {
  const record: Record<string, string> = {}
  params.forEach((value, key) => {
    if (value !== "") record[key] = value
  })
  const state = schema.parse(record)
  if (state.type && state.action && AUDIT_ACTION[state.action].entityType !== state.type) state.action = undefined
  return state
}

export function toAuditLogQuery(state: AuditLogListState): AuditLogQuery {
  return {
    ...(state.type ? { entityType: state.type } : {}),
    ...(state.action ? { action: state.action } : {}),
    ...(state.actor ? { actorId: state.actor } : {}),
    ...(state.entity ? { entityId: state.entity } : {}),
    sortOrder: state.sort ?? "desc",
    page: state.page ?? 1,
    limit: AUDIT_LOGS_PAGE_SIZE,
  }
}

export function serializeAuditLogState(state: AuditLogListState) {
  const params = new URLSearchParams()
  if (state.type) params.set("type", state.type)
  if (state.action) params.set("action", state.action)
  if (state.actor) params.set("actor", state.actor)
  if (state.entity) params.set("entity", state.entity)
  if (state.sort && state.sort !== "desc") params.set("sort", state.sort)
  if (state.page && state.page > 1) params.set("page", String(state.page))
  return params.toString()
}
