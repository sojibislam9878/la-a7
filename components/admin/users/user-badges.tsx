import { BanIcon, CheckCircle2Icon, KeyRoundIcon, MailWarningIcon, Trash2Icon } from "lucide-react"

import { STATUS_TONE_CLASS } from "@/constants/booking-status"
import { ROLE_LABEL } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { AdminUser } from "@/types/admin"
import type { Role } from "@/types/user"

const ROLE_CLASS: Record<Role, string> = {
  FARMER: "bg-primary/15 text-primary",
  WAREHOUSE_OWNER: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  ADMIN: "bg-forest text-forest-foreground",
}

const pill = "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold"

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return <span className={cn(pill, ROLE_CLASS[role], className)}>{ROLE_LABEL[role]}</span>
}

export function AccountStatusBadge({ user, className }: { user: Pick<AdminUser, "status" | "deletedAt">; className?: string }) {
  if (user.deletedAt) {
    return (
      <span className={cn(pill, STATUS_TONE_CLASS.closed, className)}>
        <Trash2Icon className="size-3.5" aria-hidden />
        Deleted
      </span>
    )
  }
  return user.status === "BANNED" ? (
    <span className={cn(pill, "bg-destructive/15 text-destructive", className)}>
      <BanIcon className="size-3.5" aria-hidden />
      Banned
    </span>
  ) : (
    <span className={cn(pill, STATUS_TONE_CLASS.active, className)}>
      <CheckCircle2Icon className="size-3.5" aria-hidden />
      Active
    </span>
  )
}

export function SignInMethods({ user }: { user: Pick<AdminUser, "emailVerified" | "hasPassword" | "linkedGoogle"> }) {
  const methods = [user.hasPassword && "Password", user.linkedGoogle && "Google"].filter(Boolean).join(" + ")
  return (
    <span className="flex flex-col gap-0.5 text-xs">
      <span className="flex items-center gap-1 text-muted-foreground">
        <KeyRoundIcon className="size-3.5" aria-hidden />
        {methods || "No sign-in method"}
      </span>
      {!user.emailVerified && (
        <span className="flex items-center gap-1 text-harvest-foreground dark:text-harvest">
          <MailWarningIcon className="size-3.5" aria-hidden />
          Email not verified
        </span>
      )}
    </span>
  )
}
