"use client"

import { TimerIcon } from "lucide-react"

import { useNow } from "@/hooks/use-now"
import { cn } from "@/lib/utils"

export function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, "0")
  const ss = String(seconds).padStart(2, "0")
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

export function HoldCountdown({ expiresAt, className }: { expiresAt: string; className?: string }) {
  const now = useNow()
  if (!now) return null
  const remaining = new Date(expiresAt).getTime() - now
  if (remaining <= 0) return null

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums", className)}
      role="timer"
      aria-label={`Payment hold ends in ${formatRemaining(remaining)}`}
    >
      <TimerIcon className="size-4" aria-hidden />
      {formatRemaining(remaining)}
    </span>
  )
}
