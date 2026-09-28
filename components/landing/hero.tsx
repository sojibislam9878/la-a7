import { CreditCardIcon, ShieldCheckIcon, ThermometerSnowflakeIcon } from "lucide-react"

import { HeroSearch } from "@/components/landing/hero-search"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/format"
import type { CropType } from "@/types/crop-type"

type HeroStats = {
  warehouses: number | null
  cropTypes: number
}

export function Hero({ cropTypes, stats }: { cropTypes: CropType[]; stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[36rem] max-w-5xl rounded-full bg-primary/15 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pt-24">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="outline" className="h-7 gap-1.5 px-3 text-sm">
            <ThermometerSnowflakeIcon className="text-primary" aria-hidden />
            Cold storage for Bangladeshi farmers
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Keep your harvest fresh.{" "}
            <span className="text-primary">Book cold storage by the kilogram.</span>
          </h1>

          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Find approved cold storage warehouses near you, reserve exactly the capacity you need for
            exact dates, and pay securely online. No phone calls, no paper ledgers, no produce left
            rotting on the truck.
          </p>

          <HeroSearch cropTypes={cropTypes} />

          <dl className="grid w-full grid-cols-3 gap-4 pt-2 sm:max-w-md">
            <HeroStat label="Approved warehouses" value={stats.warehouses === null ? "—" : formatNumber(stats.warehouses)} />
            <HeroStat label="Crop types" value={formatNumber(stats.cropTypes)} />
            <HeroStat label="Booking states tracked" value="9" />
          </dl>
        </div>

        <CapacityPreview />
      </div>
    </section>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="order-2 text-xs text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="order-1 text-2xl font-bold tracking-tight">{value}</dd>
    </div>
  )
}

const LOAD_BARS = [
  { day: "Mar 1", pct: 50 },
  { day: "Mar 5", pct: 50 },
  { day: "Mar 9", pct: 30 },
  { day: "Mar 12", pct: 70 },
  { day: "Mar 16", pct: 70 },
  { day: "Mar 20", pct: 70 },
  { day: "Mar 24", pct: 40 },
  { day: "Mar 28", pct: 40 },
]

/** Decorative illustration of the peak-load capacity model; hidden from assistive tech */
function CapacityPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-3xl border bg-card p-6 shadow-2xl shadow-primary/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Chamber C-1 · Rangpur</p>
            <p className="mt-1 text-2xl font-bold">3,000 kg available</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            2°C to 4°C
          </span>
        </div>

        <div className="mt-6 flex h-40 items-end gap-2">
          {LOAD_BARS.map((bar) => (
            <div key={bar.day} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="relative flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className={
                    bar.pct === 70
                      ? "absolute inset-x-0 bottom-0 rounded-md bg-primary"
                      : "absolute inset-x-0 bottom-0 rounded-md bg-primary/40"
                  }
                  style={{ height: `${bar.pct}%` }}
                />
              </div>
              <span className="text-center text-[10px] text-muted-foreground">{bar.day.split(" ")[1]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Daily committed load for Mar 1 to Mar 31 · peak 7,000 of 10,000 kg
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Potato · 2,500 kg</p>
            <p className="mt-1 font-semibold">৳3,500 est.</p>
          </div>
          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 font-semibold text-primary">Approved</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-lg sm:-left-6">
        <CreditCardIcon className="size-4 text-primary" />
        <span className="text-xs font-medium">Paid securely with Stripe</span>
      </div>
      <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-lg sm:-right-5">
        <ShieldCheckIcon className="size-4 text-primary" />
        <span className="text-xs font-medium">Grade A inspected</span>
      </div>
    </div>
  )
}
