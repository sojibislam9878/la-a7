"use client"

import { ArrowRightIcon, Loader2Icon, ShieldCheckIcon, SproutIcon, WarehouseIcon } from "lucide-react"

import { DEMO_ACCOUNTS, type DemoAccount } from "@/constants/demo-accounts"
import { ROLE_LABEL } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/user"

const ROLE_STYLE: Record<Role, { icon: typeof SproutIcon; blob: string }> = {
  FARMER: {
    icon: SproutIcon,
    blob: "rounded-[62%_38%_46%_54%/60%_44%_56%_40%] bg-primary/15 text-primary",
  },
  WAREHOUSE_OWNER: {
    icon: WarehouseIcon,
    blob: "rounded-[40%_60%_58%_42%/50%_58%_42%_50%] bg-harvest/25 text-harvest-foreground dark:text-harvest",
  },
  ADMIN: {
    icon: ShieldCheckIcon,
    blob: "rounded-[50%_50%_40%_60%/45%_55%_45%_55%] bg-soil/15 text-soil",
  },
}

export function DemoLogin({
  onSelect,
  pendingRole,
  disabled,
}: {
  onSelect: (account: DemoAccount) => void
  pendingRole: Role | null
  disabled: boolean
}) {
  return (
    <section
      aria-labelledby="demo-login-heading"
      className="rounded-3xl border border-dashed border-soil/25 bg-cream/60 p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 id="demo-login-heading" className="font-semibold">
            One-click demo login
          </h2>
          <p className="text-xs text-muted-foreground">Explore the platform as any of the three roles.</p>
        </div>
        <span className="shrink-0 rounded-full bg-harvest/25 px-2.5 py-1 text-[11px] font-semibold text-harvest-foreground dark:text-harvest">
          For evaluators
        </span>
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const style = ROLE_STYLE[account.role]
          const pending = pendingRole === account.role

          return (
            <li key={account.role}>
              <button
                type="button"
                onClick={() => onSelect(account)}
                disabled={disabled}
                aria-busy={pending}
                className={cn(
                  "group relative flex h-full w-full items-center gap-3 rounded-2xl border-2 border-soil/10 bg-card p-3 text-left transition-all outline-none sm:flex-col sm:items-start sm:gap-2.5",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:pointer-events-none disabled:opacity-60",
                  pending && "border-primary opacity-100!"
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center", style.blob)}>
                  <style.icon className="size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="pr-6 text-sm font-semibold sm:pr-0">{ROLE_LABEL[account.role]}</span>
                  <span className="text-xs text-muted-foreground">{account.description}</span>
                </span>
                <span className="absolute top-1/2 right-3 -translate-y-1/2 sm:top-3 sm:translate-y-0">
                  {pending ? (
                    <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden />
                  ) : (
                    <ArrowRightIcon
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="sr-only">
                  {pending ? "Logging in..." : `Log in as the demo ${ROLE_LABEL[account.role].toLowerCase()}`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
