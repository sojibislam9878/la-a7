import { cn } from "@/lib/utils"

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-12", className)} aria-hidden focusable="false">
      <path d="M32 60 C31 44 33 26 44 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 34 C22 34 12 26 10 12 C24 12 34 20 36 34 Z" fill="currentColor" opacity="0.85" />
      <path d="M39 22 C50 22 58 16 60 4 C48 4 40 10 39 22 Z" fill="currentColor" opacity="0.6" />
      <path d="M33 48 C44 48 52 42 54 30 C42 30 34 36 33 48 Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
