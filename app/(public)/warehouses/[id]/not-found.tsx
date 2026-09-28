import Link from "next/link"
import { SearchIcon, WarehouseIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function WarehouseNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        icon={WarehouseIcon}
        title="This warehouse doesn't exist"
        description="It may have been removed, or the link is wrong. Browse approved cold storage instead."
        action={
          <Button className="rounded-full" asChild>
            <Link href="/warehouses">
              <SearchIcon data-icon="inline-start" aria-hidden />
              Find storage
            </Link>
          </Button>
        }
      />
    </div>
  )
}
