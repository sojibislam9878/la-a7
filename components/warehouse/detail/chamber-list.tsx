import { SnowflakeIcon, ThermometerIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { formatKg, formatTempRange } from "@/lib/format"
import type { Chamber } from "@/types/warehouse"

const SCALE_MIN = -5
const SCALE_MAX = 20

function position(tempC: number) {
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, tempC))
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100
}

export function ChamberList({ chambers }: { chambers: Chamber[] }) {
  return (
    <section aria-labelledby="chambers-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="chambers-heading" className="font-display text-2xl font-semibold">
          Chambers
        </h2>
        <p className="text-sm text-muted-foreground">
          Each chamber holds its own temperature range. Your crop must fit inside it.
        </p>
      </div>

      {chambers.length === 0 ? (
        <EmptyState
          icon={SnowflakeIcon}
          title="No active chambers"
          description="This warehouse has no chambers open for booking right now."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {chambers.map((chamber) => (
            <li key={chamber.id} className="flex flex-col gap-4 rounded-2xl border border-soil/10 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-[55%_45%_50%_50%/60%_50%_50%_40%] bg-sky-500/15 text-sky-700 dark:text-sky-300">
                    <SnowflakeIcon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold">Chamber {chamber.name}</p>
                    <p className="text-sm text-muted-foreground">{formatKg(chamber.capacityKg)} capacity</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-medium dark:bg-muted">
                  <ThermometerIcon className="size-3.5" aria-hidden />
                  {formatTempRange(chamber.minTempC, chamber.maxTempC)}
                </span>
              </div>

              <div aria-hidden className="flex flex-col gap-1.5">
                <div className="relative h-2 rounded-full bg-gradient-to-r from-sky-500/25 via-primary/20 to-harvest/30">
                  <div
                    className="absolute inset-y-0 rounded-full bg-sky-600 dark:bg-sky-400"
                    style={{
                      left: `${position(chamber.minTempC)}%`,
                      width: `${Math.max(2, position(chamber.maxTempC) - position(chamber.minTempC))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{SCALE_MIN}°C</span>
                  <span>0°C</span>
                  <span>{SCALE_MAX}°C</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
