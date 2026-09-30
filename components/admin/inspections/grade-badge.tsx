import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { QUALITY_GRADE } from "@/constants/quality-grade"
import { cn } from "@/lib/utils"
import type { QualityGrade } from "@/types/booking"

export const gradeToneClass = (grade: QualityGrade) =>
  grade === "REJECTED" ? "bg-destructive/15 text-destructive" : STATUS_TONE_CLASS[QUALITY_GRADE[grade].tone]

export function GradeMark({ grade, className }: { grade: QualityGrade; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        gradeToneClass(grade),
        className
      )}
      aria-hidden
    >
      {QUALITY_GRADE[grade].short}
    </span>
  )
}
