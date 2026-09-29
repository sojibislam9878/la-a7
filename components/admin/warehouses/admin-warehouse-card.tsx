import Link from "next/link"
import { format, formatDistanceToNowStrict, parseISO } from "date-fns"
import {
  BadgeCheckIcon,
  BoxesIcon,
  BuildingIcon,
  CalendarClockIcon,
  DoorOpenIcon,
  ExternalLinkIcon,
  FileBadgeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react"

import { DECISIONS_FOR, WarehouseDecisionDialog } from "@/components/admin/warehouses/warehouse-decision-dialog"
import { WarehouseStatusBadge } from "@/components/owner/warehouses/warehouse-status-badge"
import { Button } from "@/components/ui/button"
import { statusLabel } from "@/hooks/use-admin-warehouses"
import { formatKg, formatMoney } from "@/lib/format"
import type { AdminWarehouse } from "@/types/admin"

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}

export function AdminWarehouseCard({ warehouse }: { warehouse: AdminWarehouse }) {
  const { owner, lastDecision } = warehouse

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-soil/10 bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold">{warehouse.name}</h2>
            <WarehouseStatusBadge status={warehouse.status} />
          </div>
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {warehouse.address}, {warehouse.district}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted {formatDistanceToNowStrict(parseISO(warehouse.createdAt), { addSuffix: true })} ·{" "}
            {format(parseISO(warehouse.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {DECISIONS_FOR[warehouse.status].map((decision) => (
            <WarehouseDecisionDialog key={decision} warehouse={warehouse} decision={decision} />
          ))}
          {warehouse.status === "APPROVED" && (
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link href={`/warehouses/${warehouse.id}`} target="_blank">
                <ExternalLinkIcon data-icon="inline-start" aria-hidden />
                Listing
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label="Owner" className="flex flex-col gap-3 rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Owner</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact icon={BuildingIcon} label="Business" value={owner.businessName ?? "No business profile"} />
            <Fact icon={BadgeCheckIcon} label="Owner" value={owner.name} />
            <Fact icon={MailIcon} label="Email" value={owner.email} />
            <Fact icon={PhoneIcon} label="Phone" value={owner.phone ?? "Not added"} />
          </dl>
        </section>
        <section aria-label="Listing" className="flex flex-col gap-3 rounded-2xl bg-cream/60 p-4 dark:bg-muted/40">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Listing</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact icon={FileBadgeIcon} label="Cold storage license" value={warehouse.licenseNo} />
            <Fact icon={FileBadgeIcon} label="Owner trade license" value={owner.tradeLicenseNo ?? "Missing"} />
            <Fact
              icon={DoorOpenIcon}
              label="Active chambers"
              value={`${warehouse.chamberCount} · ${formatKg(warehouse.totalCapacityKg)}`}
            />
            <Fact
              icon={TagIcon}
              label="Base rate"
              value={`${formatMoney(warehouse.ratePerKgPerDay, { maximumFractionDigits: 4 })} /kg/day`}
            />
            <Fact icon={CalendarClockIcon} label="Minimum stay" value={`${warehouse.minBookingDays} days`} />
            <Fact
              icon={BoxesIcon}
              label="Rating"
              value={warehouse.reviewCount > 0 && warehouse.avgRating !== null ? `${warehouse.avgRating.toFixed(1)} (${warehouse.reviewCount})` : "No reviews"}
            />
          </dl>
        </section>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        {!owner.tradeLicenseNo && (
          <p className="rounded-xl bg-harvest/15 px-3 py-2 text-harvest-foreground dark:text-harvest">
            The owner has no business profile yet, so there&apos;s no trade license to check against.
          </p>
        )}
        {lastDecision && (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{statusLabel(lastDecision.status)}</span>
            {lastDecision.by ? ` by ${lastDecision.by}` : ""} on {format(parseISO(lastDecision.at), "MMM d, yyyy")}
            {lastDecision.reason ? `: “${lastDecision.reason}”` : ""}
          </p>
        )}
      </div>
    </article>
  )
}
