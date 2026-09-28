import {
  BanIcon,
  CalendarXIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  CreditCardIcon,
  LogOutIcon,
  type LucideIcon,
  PackageCheckIcon,
  XCircleIcon,
} from "lucide-react"

import type { Booking, BookingStatus } from "@/types/booking"

export type StatusTone = "waiting" | "action" | "active" | "done" | "closed"

export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  waiting: "bg-harvest/20 text-harvest-foreground dark:text-harvest",
  action: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  active: "bg-primary/15 text-primary",
  done: "bg-forest text-forest-foreground",
  closed: "bg-muted text-muted-foreground",
}

export const BOOKING_STATUS: Record<
  BookingStatus,
  { label: string; tone: StatusTone; icon: LucideIcon; farmerHint: string }
> = {
  PENDING_APPROVAL: {
    label: "Awaiting approval",
    tone: "waiting",
    icon: ClockIcon,
    farmerHint: "The warehouse owner is reviewing your request.",
  },
  APPROVED: {
    label: "Approved, pay now",
    tone: "action",
    icon: CreditCardIcon,
    farmerHint: "Your space is held. Pay before the hold runs out to confirm it.",
  },
  PAID: {
    label: "Paid",
    tone: "active",
    icon: CircleDollarSignIcon,
    farmerHint: "Payment received. Bring your produce in on your start date for grading.",
  },
  STORED: {
    label: "In storage",
    tone: "active",
    icon: PackageCheckIcon,
    farmerHint: "Your lot is in the chamber. Request withdrawal when you're ready to collect it.",
  },
  WITHDRAW_REQUESTED: {
    label: "Withdrawal requested",
    tone: "waiting",
    icon: LogOutIcon,
    farmerHint: "The owner will release your lot and settle the final bill.",
  },
  COMPLETED: {
    label: "Completed",
    tone: "done",
    icon: CheckCircle2Icon,
    farmerHint: "Your lot was collected and the bill is settled.",
  },
  REJECTED: { label: "Rejected", tone: "closed", icon: XCircleIcon, farmerHint: "The owner declined this request." },
  CANCELLED: { label: "Cancelled", tone: "closed", icon: BanIcon, farmerHint: "This booking was cancelled." },
  EXPIRED: {
    label: "Expired",
    tone: "closed",
    icon: CalendarXIcon,
    farmerHint: "The payment window closed before this booking was paid.",
  },
}

export const HOLD_EXPIRED_STATUS = {
  label: "Payment window closed",
  tone: "closed" as StatusTone,
  icon: CalendarXIcon,
  farmerHint: "The payment hold ran out. Book again to reserve the space.",
}

export function isHoldExpired(booking: Pick<Booking, "status" | "holdExpiresAt">, now = Date.now()) {
  return booking.status === "APPROVED" && !!booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() <= now
}

export function statusMeta(booking: Pick<Booking, "status" | "holdExpiresAt">, now?: number) {
  return isHoldExpired(booking, now) ? HOLD_EXPIRED_STATUS : BOOKING_STATUS[booking.status]
}

export const LIFECYCLE = ["PENDING_APPROVAL", "APPROVED", "PAID", "STORED", "WITHDRAW_REQUESTED", "COMPLETED"] as const satisfies readonly BookingStatus[]

export const LIFECYCLE_LABEL: Record<(typeof LIFECYCLE)[number], string> = {
  PENDING_APPROVAL: "Requested",
  APPROVED: "Approved",
  PAID: "Paid",
  STORED: "Stored",
  WITHDRAW_REQUESTED: "Withdrawal",
  COMPLETED: "Completed",
}

export const STATUS_FILTERS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_APPROVAL", label: "Awaiting approval" },
  { value: "APPROVED", label: "To pay" },
  { value: "PAID", label: "Paid" },
  { value: "STORED", label: "In storage" },
  { value: "WITHDRAW_REQUESTED", label: "Withdrawing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
]
