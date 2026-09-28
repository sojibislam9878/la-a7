import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ready to protect this season&apos;s harvest?
        </h2>
        <p className="text-lg text-pretty text-muted-foreground">
          Create a free farmer account and book cold storage in minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Create free account
              <ArrowRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/warehouses">Browse warehouses</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
