"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { AlertCircleIcon, ArrowUpDownIcon, ChevronRightIcon, RotateCwIcon, UsersIcon } from "lucide-react"

import { AccountStatusBadge, RoleBadge, SignInMethods } from "@/components/admin/users/user-badges"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageLinks } from "@/components/shared/page-links"
import { UrlSearchInput } from "@/components/shared/url-search-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminUsers } from "@/hooks/use-admin-users"
import {
  ADMIN_USER_SORT_OPTIONS,
  type AdminUserListState,
  DEFAULT_ADMIN_USER_SORT,
  parseAdminUserState,
  serializeAdminUserState,
  toAdminUserQuery,
} from "@/lib/admin-user-query"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatNumber, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { AdminUser } from "@/types/admin"

const ROLE_TABS: { value: AdminUserListState["role"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "Everyone" },
  { value: "FARMER", label: "Farmers" },
  { value: "WAREHOUSE_OWNER", label: "Warehouse owners" },
  { value: "ADMIN", label: "Admins" },
]

const ANY = "any"
const triggerClass = "h-10! w-full rounded-xl border-soil/15 bg-card text-left sm:w-44 *:data-[slot=select-value]:grow"

function UserIdentity({ user, href }: { user: AdminUser; href: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <Link
          href={href}
          className="block truncate font-semibold after:absolute after:inset-0 hover:text-primary focus-visible:outline-none"
        >
          {user.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

export function AdminUsers() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.toString()
  const state = useMemo(() => parseAdminUserState(new URLSearchParams(current)), [current])
  const query = useMemo(() => toAdminUserQuery(state), [state])
  const users = useAdminUsers(query)

  const hrefFor = (next: AdminUserListState) => {
    const qs = serializeAdminUserState(next)
    return qs ? `${pathname}?${qs}` : pathname
  }
  const go = (next: AdminUserListState) => router.replace(hrefFor({ ...next, page: undefined }), { scroll: false })

  const commitSearch = useCallback(
    (q: string) => {
      const next = { ...parseAdminUserState(new URLSearchParams(current)), q: q || undefined, page: undefined }
      const qs = serializeAdminUserState(next)
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [current, pathname, router]
  )

  const data = users.data
  const narrowed = !!(state.q || state.role || state.status || state.verified)
  const detailHref = (user: AdminUser) => `/admin/users/${user.id}`

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Users" description="Everyone on AgroStore. Open an account to ban it, lift a ban or change its role." />

      <nav aria-label="Filter by role" className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-1.5">
          {ROLE_TABS.map((tab) => {
            const active = (state.role ?? "ALL") === tab.value
            return (
              <li key={tab.value}>
                <Link
                  href={hrefFor({ ...state, role: tab.value === "ALL" ? undefined : tab.value, page: undefined })}
                  replace
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-soil/15 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput
          id="admin-user-search"
          urlValue={state.q ?? ""}
          onCommit={commitSearch}
          label="Search users by name or email"
          placeholder="Search name or email"
          className="w-full min-w-60 sm:w-auto sm:flex-1"
        />
        <Select value={state.status ?? ANY} onValueChange={(value) => go({ ...state, status: value === ANY ? undefined : (value as AdminUser["status"]) })}>
          <SelectTrigger aria-label="Account status" className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ANY}>Any status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={state.verified ?? ANY}
          onValueChange={(value) => go({ ...state, verified: value === ANY ? undefined : (value as "true" | "false") })}
        >
          <SelectTrigger aria-label="Email verification" className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value={ANY}>Verified or not</SelectItem>
            <SelectItem value="true">Email verified</SelectItem>
            <SelectItem value="false">Not verified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={state.sort ?? DEFAULT_ADMIN_USER_SORT} onValueChange={(sort) => go({ ...state, sort })}>
          <SelectTrigger aria-label="Sort users" className={triggerClass}>
            <ArrowUpDownIcon aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" position="popper">
            {ADMIN_USER_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex h-10 items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
          <Checkbox
            checked={!!state.deleted}
            onCheckedChange={(checked) => go({ ...state, deleted: checked === true ? "1" : undefined })}
          />
          Show deleted
        </label>
      </div>

      {users.isError ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Couldn&apos;t load users</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(users.error)}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => users.refetch()}>
              <RotateCwIcon data-icon="inline-start" aria-hidden />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : !data ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading users">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users match"
          description={narrowed ? "Try a different search or clear the filters." : "Nobody has signed up yet."}
          action={
            narrowed ? (
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={pathname}>Clear filters</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", users.isPlaceholderData && "opacity-60")}>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {formatNumber(data.meta.total)} {data.meta.total === 1 ? "user" : "users"}
          </p>

          <div className="hidden overflow-hidden rounded-2xl border border-soil/10 bg-card lg:block">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 dark:bg-muted/30">
                <tr className="text-left text-xs text-muted-foreground uppercase">
                  <th scope="col" className="px-5 py-3 font-semibold">User</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Sign-in</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                  <th scope="col" className="w-10 px-5 py-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/10">
                {data.items.map((user) => (
                  <tr key={user.id} className="relative transition-colors hover:bg-cream/40 dark:hover:bg-muted/20">
                    <td className="max-w-72 px-5 py-3">
                      <UserIdentity user={user} href={detailHref(user)} />
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={user.role} />
                      {user.role === "WAREHOUSE_OWNER" && !user.profileComplete && (
                        <p className="mt-1 text-xs text-muted-foreground">No business profile</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <AccountStatusBadge user={user} />
                    </td>
                    <td className="px-5 py-3">
                      <SignInMethods user={user} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {format(parseISO(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <ChevronRightIcon className="size-4" aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {data.items.map((user) => (
              <li key={user.id} className="relative flex flex-col gap-3 rounded-2xl border border-soil/10 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <UserIdentity user={user} href={detailHref(user)} />
                  <ChevronRightIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <AccountStatusBadge user={user} />
                  <span className="text-xs text-muted-foreground">Joined {format(parseISO(user.createdAt), "MMM d, yyyy")}</span>
                </div>
                <SignInMethods user={user} />
              </li>
            ))}
          </ul>

          <PageLinks
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            hrefFor={(page) => hrefFor({ ...state, page })}
            scroll={false}
          />
        </div>
      )}
    </div>
  )
}
