"use client"

import { useId, useState } from "react"
import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"]

export function StarRatingInput({
  value,
  onChange,
  onBlur,
  name,
  invalid,
  labelledBy,
  describedBy,
}: {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  name: string
  invalid?: boolean
  labelledBy?: string
  describedBy?: string
}) {
  const [hover, setHover] = useState(0)
  const baseId = useId()
  const shown = hover || value

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const id = `${baseId}-${star}`
          return (
            <label
              key={star}
              htmlFor={id}
              onMouseEnter={() => setHover(star)}
              className="group/star cursor-pointer rounded-lg p-0.5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                onBlur={onBlur}
                className="sr-only"
              />
              <span className="sr-only">
                {star} {star === 1 ? "star" : "stars"}, {RATING_LABELS[star]}
              </span>
              <StarIcon
                aria-hidden
                className={cn(
                  "size-8 transition-transform group-active/star:scale-90",
                  star <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
                  star === hover && "scale-110"
                )}
              />
            </label>
          )
        })}
      </div>
      <span className="min-w-20 text-sm font-medium text-muted-foreground" aria-hidden>
        {RATING_LABELS[shown]}
      </span>
    </div>
  )
}
