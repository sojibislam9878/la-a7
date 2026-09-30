import { ROLE_LABEL } from "@/constants/routes"
import { formatNumber } from "@/lib/format"
import type { AuditLogEntry } from "@/types/admin"
import type { Role } from "@/types/user"

type Fields = Record<string, unknown>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const asFields = (value: unknown): Fields =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Fields) : {}

export function humanizeEnum(value: string) {
  if (value in ROLE_LABEL) return ROLE_LABEL[value as Role]
  const text = value.replaceAll("_", " ").toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function humanizeKey(key: string) {
  const text = key
    .replace(/Bdt$/, " (BDT)")
    .replace(/Kg$/, " (kg)")
    .replace(/Pct$/, " (%)")
    .replace(/Id$/, " ID")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatAuditValue(key: string, value: unknown): { text: string; title?: string; mono?: boolean } {
  if (value === null || value === undefined) return { text: "—" }
  if (typeof value === "boolean") return { text: value ? "Yes" : "No" }
  if (typeof value === "number") return { text: formatNumber(value) }
  if (typeof value === "string") {
    if (UUID.test(value)) return { text: `${value.slice(0, 8)}…`, title: value, mono: true }
    if (key === "status" || key === "role") return { text: humanizeEnum(value) }
    return { text: value }
  }
  return { text: JSON.stringify(value), mono: true }
}

export function auditDiff(entry: AuditLogEntry) {
  const before = asFields(entry.before)
  const after = asFields(entry.after)
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (key) => (before[key] ?? null) !== null || (after[key] ?? null) !== null
  )
  return keys.map((key) => ({
    key,
    before: before[key],
    after: after[key],
    changed: JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    hasBefore: entry.before !== null && entry.before !== undefined,
    hasAfter: entry.after !== null && entry.after !== undefined,
  }))
}

export function describeAudit(entry: AuditLogEntry) {
  const before = asFields(entry.before)
  const after = asFields(entry.after)
  const reason = typeof after.reason === "string" && after.reason ? after.reason : null
  const str = (value: unknown) => (typeof value === "string" ? value : null)
  const num = (value: unknown) => (typeof value === "number" ? value : null)

  let detail: string | null = null
  if (str(before.status) && str(after.status) && before.status !== after.status) {
    detail = `${humanizeEnum(before.status as string)} → ${humanizeEnum(after.status as string)}`
  } else if (str(before.role) && str(after.role)) {
    detail = `${humanizeEnum(before.role as string)} → ${humanizeEnum(after.role as string)}`
  } else if (entry.action === "INSPECTION_RECORDED" && str(after.grade)) {
    const grade = after.grade === "REJECTED" ? "Rejected" : `Grade ${after.grade}`
    const actual = num(after.actualQtyKg)
    const declared = num(after.declaredQtyKg)
    detail =
      actual !== null && declared !== null
        ? `${grade} · weighed ${formatNumber(actual)} of ${formatNumber(declared)} kg`
        : grade
  } else if (entry.action === "BOOKING_CREATED") {
    const quantity = num(after.quantityKg)
    detail = [str(after.lotCode), quantity !== null ? `${formatNumber(quantity)} kg` : null].filter(Boolean).join(" · ") || null
  } else if (num(before.rating) !== null && num(after.rating) !== null) {
    detail = `${before.rating}★ → ${after.rating}★`
  } else if (num(after.rating) !== null) {
    detail = `${after.rating}★`
  } else if (num(before.rating) !== null) {
    detail = `Was ${before.rating}★`
  }

  return { detail, reason }
}
