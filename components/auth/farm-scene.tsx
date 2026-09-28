import { cn } from "@/lib/utils"

/**
 * Decorative landscape: harvest sun, rolling hills, field rows and a cold
 * storage barn. Colors are fixed because it always sits on the forest panel.
 */
export function FarmScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMax slice"
      className={cn("w-full", className)}
      aria-hidden
      focusable="false"
    >
      {/* Sun with halo */}
      <circle cx="455" cy="112" r="96" fill="var(--harvest)" opacity="0.1" />
      <circle cx="455" cy="112" r="72" fill="var(--harvest)" opacity="0.16" />
      <circle cx="455" cy="112" r="50" fill="var(--harvest)" />

      {/* Birds */}
      <path d="M150 92 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="oklch(0.9 0.03 90 / 0.6)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M205 70 q6 -6 12 0 q6 -6 12 0" fill="none" stroke="oklch(0.9 0.03 90 / 0.45)" strokeWidth="2" strokeLinecap="round" />

      {/* Far hill */}
      <path d="M0 210 C110 160 210 168 318 196 S520 150 600 172 V360 H0Z" fill="oklch(0.42 0.08 150)" />

      {/* Middle hill with the cold storage barn */}
      <path d="M0 252 C130 208 262 222 380 250 S540 226 600 238 V360 H0Z" fill="oklch(0.5 0.11 146)" />
      <g>
        <rect x="378" y="206" width="84" height="50" rx="4" fill="oklch(0.95 0.025 90)" />
        <path d="M368 210 L420 176 L472 210 Z" fill="oklch(0.55 0.08 50)" />
        <rect x="406" y="224" width="28" height="32" rx="3" fill="oklch(0.55 0.08 50)" />
        <path d="M420 224 V256 M406 240 H434" stroke="oklch(0.95 0.025 90)" strokeWidth="2" />
        {/* Snowflake badge = cold storage */}
        <circle cx="444" cy="196" r="11" fill="oklch(0.78 0.08 230)" />
        <path
          d="M444 188 V204 M437 192 L451 200 M451 192 L437 200"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Trees */}
      <g fill="oklch(0.36 0.08 150)">
        <circle cx="96" cy="222" r="18" />
        <circle cx="118" cy="214" r="22" />
        <rect x="104" y="226" width="6" height="22" rx="2" />
        <circle cx="530" cy="222" r="15" />
        <rect x="527" y="230" width="5" height="18" rx="2" />
      </g>

      {/* Front field with crop rows */}
      <path d="M0 296 C150 262 310 276 440 298 S560 284 600 290 V360 H0Z" fill="oklch(0.62 0.13 138)" />
      <g fill="none" stroke="oklch(0.54 0.12 138)" strokeWidth="3" strokeLinecap="round">
        <path d="M-10 322 C150 292 320 304 470 326" />
        <path d="M-10 342 C170 312 340 324 520 346" />
        <path d="M60 362 C230 334 400 342 610 360" />
      </g>

      {/* Potato sacks in the foreground */}
      <g>
        <path d="M70 318 q-10 -26 8 -34 h20 q18 8 8 34 z" fill="oklch(0.72 0.07 70)" />
        <path d="M76 286 h24" stroke="oklch(0.55 0.08 50)" strokeWidth="3" strokeLinecap="round" />
        <path d="M112 322 q-8 -22 7 -28 h16 q15 6 7 28 z" fill="oklch(0.66 0.07 65)" />
        <path d="M117 296 h20" stroke="oklch(0.5 0.08 50)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
