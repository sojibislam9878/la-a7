"use client"

import { format, parseISO } from "date-fns"
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, XAxis, YAxis } from "recharts"

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { formatKg } from "@/lib/format"
import type { DailyLoad } from "@/types/warehouse"

const chartConfig = {
  usedKg: { label: "Booked", color: "var(--primary)" },
} satisfies ChartConfig

type TooltipPayload = { payload?: DailyLoad }[]

function LoadTooltip({ active, payload, capacityKg }: { active?: boolean; payload?: TooltipPayload; capacityKg: number }) {
  const day = payload?.[0]?.payload
  if (!active || !day) return null
  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium">{format(parseISO(day.date), "EEE, MMM d")}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-0.5 w-3 rounded-full bg-primary" aria-hidden />
          Booked
        </span>
        <span className="font-semibold text-foreground">{formatKg(day.usedKg)}</span>
      </p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Free</span>
        <span className="font-semibold text-foreground">{formatKg(day.freeKg)}</span>
      </p>
      <p className="text-muted-foreground">of {formatKg(capacityKg)} capacity</p>
    </div>
  )
}

export default function ChamberLoadChart({ days, capacityKg }: { days: DailyLoad[]; capacityKg: number }) {
  const peak = days.reduce((max, day) => Math.max(max, day.usedKg), 0)
  const peakIndex = peak > 0 ? days.findIndex((day) => day.usedKg === peak) : -1

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={days} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tickMargin={8}
          tickFormatter={(value: string) => format(parseISO(value), "MMM d")}
        />
        <YAxis
          width={52}
          tickLine={false}
          axisLine={false}
          domain={[0, capacityKg]}
          tickFormatter={(value: number) => formatKg(value)}
        />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<LoadTooltip capacityKg={capacityKg} />} />
        <ReferenceLine
          y={capacityKg}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          label={{ value: "Capacity", position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <Bar dataKey="usedKg" fill="var(--color-usedKg)" radius={[4, 4, 0, 0]} maxBarSize={24} minPointSize={0}>
          <LabelList
            dataKey="usedKg"
            content={({ x, y, width, index }) =>
              index === peakIndex ? (
                <text
                  x={Number(x) + Number(width) / 2}
                  y={Number(y) - 6}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-medium"
                >
                  Peak {formatKg(peak)}
                </text>
              ) : null
            }
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
