import { CheckCircle2Icon, SnowflakeIcon, SproutIcon } from "lucide-react"

/** Decorative glass card showing what a booking looks like; hidden from assistive tech */
export function BookingPreview() {
  return (
    <div
      aria-hidden
      className="w-full max-w-sm -rotate-2 rounded-3xl border border-forest-foreground/15 bg-forest-foreground/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[55%_45%_50%_50%/60%_50%_50%_40%] bg-harvest text-harvest-foreground">
            <SproutIcon className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Potato · 2,500 kg</p>
            <p className="text-xs text-forest-foreground/70">Mar 1 to Apr 5 · 35 days</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground">
          <CheckCircle2Icon className="size-3.5" />
          Approved
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-forest/60 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-forest-foreground/80">
          <SnowflakeIcon className="size-4 text-harvest" />
          Chamber C-1 · 2°C to 4°C
        </span>
        <span className="font-semibold">৳3,500</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-forest-foreground/70">
          <span>Chamber load</span>
          <span>7,000 / 10,000 kg</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-foreground/15">
          <div className="h-full w-[70%] rounded-full bg-harvest" />
        </div>
      </div>
    </div>
  )
}
