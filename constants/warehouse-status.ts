import { BanIcon, CheckCircle2Icon, ClockIcon, type LucideIcon, XCircleIcon } from "lucide-react"

import type { StatusTone } from "@/constants/booking-status"
import type { WarehouseStatus } from "@/types/warehouse"

export const WAREHOUSE_STATUS: Record<WarehouseStatus, { label: string; tone: StatusTone; icon: LucideIcon; hint: string }> = {
  PENDING: {
    label: "Under review",
    tone: "waiting",
    icon: ClockIcon,
    hint: "An admin is checking your license. Farmers can't see it yet, but you can add chambers now.",
  },
  APPROVED: {
    label: "Live",
    tone: "active",
    icon: CheckCircle2Icon,
    hint: "Listed on the search page. Farmers can book any active chamber.",
  },
  REJECTED: {
    label: "Rejected",
    tone: "closed",
    icon: XCircleIcon,
    hint: "Not listed. Fix the details and contact support@agrostore.com to request another review.",
  },
  SUSPENDED: {
    label: "Suspended",
    tone: "closed",
    icon: BanIcon,
    hint: "Hidden from farmers by an admin. Existing lots stay in storage.",
  },
}

export const WAREHOUSE_STATUS_FILTERS: { value: WarehouseStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "APPROVED", label: "Live" },
  { value: "PENDING", label: "Under review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
]
