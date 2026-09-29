import type { StatusTone } from "@/constants/booking-status"
import type { QualityGrade } from "@/types/booking"

export const QUALITY_GRADE: Record<QualityGrade, { label: string; short: string; description: string; tone: StatusTone }> = {
  A: { label: "Grade A", short: "A", description: "Premium. Firm, clean, uniform size, no damage.", tone: "active" },
  B: { label: "Grade B", short: "B", description: "Standard. Minor blemishes or size variation.", tone: "action" },
  C: { label: "Grade C", short: "C", description: "Below standard but storable. Visible defects.", tone: "waiting" },
  REJECTED: {
    label: "Rejected",
    short: "✕",
    description: "Not fit for storage. Rot, pests or too wet. Cancels the booking.",
    tone: "closed",
  },
}

export const QUALITY_GRADES = ["A", "B", "C", "REJECTED"] as const satisfies readonly QualityGrade[]
