import Link from "next/link"
import { ArrowLeftIcon, SearchIcon } from "lucide-react"

import { Leaf } from "@/components/shared/leaf"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden bg-cream bg-grain px-4 text-center">
      <Leaf className="absolute top-16 left-[12%] size-20 -rotate-12 text-primary/20" />
      <Leaf className="absolute right-[10%] bottom-20 size-24 rotate-[150deg] text-harvest/40" />
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <p className="font-display text-8xl font-semibold text-primary">404</p>
        <h1 className="font-display text-3xl font-semibold">This field is empty</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" className="rounded-full" asChild>
          <Link href="/">
            <ArrowLeftIcon data-icon="inline-start" aria-hidden />
            Back to home
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href="/warehouses">
            <SearchIcon data-icon="inline-start" aria-hidden />
            Find storage
          </Link>
        </Button>
      </div>
    </main>
  )
}
