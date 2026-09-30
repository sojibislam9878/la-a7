import {
  CalendarCheckIcon,
  CreditCardIcon,
  type LucideIcon,
  StarIcon,
  UserRoundIcon,
  WarehouseIcon,
} from "lucide-react"

export const AUDIT_ENTITY_TYPES = ["Booking", "Payment", "User", "Warehouse", "Review"] as const

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export const AUDIT_ENTITY: Record<AuditEntityType, { label: string; singular: string; icon: LucideIcon }> = {
  Booking: { label: "Bookings", singular: "booking", icon: CalendarCheckIcon },
  Payment: { label: "Payments", singular: "payment", icon: CreditCardIcon },
  User: { label: "Users", singular: "user", icon: UserRoundIcon },
  Warehouse: { label: "Warehouses", singular: "warehouse", icon: WarehouseIcon },
  Review: { label: "Reviews", singular: "review", icon: StarIcon },
}

export const AUDIT_ACTION: Record<string, { label: string; entityType: AuditEntityType }> = {
  BOOKING_CREATED: { label: "Booking requested", entityType: "Booking" },
  BOOKING_APPROVED: { label: "Booking approved", entityType: "Booking" },
  BOOKING_REJECTED: { label: "Booking rejected", entityType: "Booking" },
  BOOKING_CANCELLED: { label: "Booking cancelled", entityType: "Booking" },
  BOOKING_STORED: { label: "Lot stored", entityType: "Booking" },
  BOOKING_WITHDRAW_REQUESTED: { label: "Withdrawal requested", entityType: "Booking" },
  BOOKING_COMPLETED: { label: "Booking completed", entityType: "Booking" },
  INSPECTION_RECORDED: { label: "Inspection recorded", entityType: "Booking" },
  PAYMENT_SUCCEEDED: { label: "Payment succeeded", entityType: "Booking" },
  PAYMENT_FAILED: { label: "Payment failed", entityType: "Booking" },
  PAYMENT_SUCCEEDED_WITHOUT_BOOKING: { label: "Paid after booking closed", entityType: "Booking" },
  PAYMENT_REFUNDED: { label: "Payment refunded", entityType: "Payment" },
  USER_BANNED: { label: "Account banned", entityType: "User" },
  USER_UNBANNED: { label: "Account unbanned", entityType: "User" },
  USER_ROLE_CHANGED: { label: "Role changed", entityType: "User" },
  WAREHOUSE_STATUS_CHANGED: { label: "Warehouse status changed", entityType: "Warehouse" },
  REVIEW_CREATED: { label: "Review posted", entityType: "Review" },
  REVIEW_UPDATED: { label: "Review edited", entityType: "Review" },
  REVIEW_DELETED: { label: "Review deleted", entityType: "Review" },
}

export const AUDIT_ACTIONS = Object.keys(AUDIT_ACTION)

export function auditActionLabel(action: string) {
  const known = AUDIT_ACTION[action]?.label
  if (known) return known
  const text = action.replaceAll("_", " ").toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
