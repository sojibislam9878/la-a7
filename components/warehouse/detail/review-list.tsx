import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon, MessageSquareQuoteIcon } from "lucide-react"

import { Stars } from "@/components/review/stars"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Paginated } from "@/types/api"
import type { Review } from "@/types/warehouse"

export function ReviewList({
  reviews,
  avgRating,
  reviewCount,
  pageHref,
}: {
  reviews: Paginated<Review>
  avgRating: number | null
  reviewCount: number
  pageHref: (page: number) => string
}) {
  const { items, meta } = reviews

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="flex scroll-mt-24 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="reviews-heading" className="font-display text-2xl font-semibold">
            Reviews
          </h2>
          <p className="text-sm text-muted-foreground">Only farmers who completed a booking here can leave a review.</p>
        </div>
        {avgRating !== null && reviewCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-soil/10 bg-card px-4 py-2">
            <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
            <div className="flex flex-col gap-0.5">
              <Stars rating={avgRating} />
              <span className="text-xs text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuoteIcon}
          title="No reviews yet"
          description="Reviews appear here once farmers complete a booking at this warehouse."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((review) => (
            <li key={review.id} className="flex gap-4 rounded-2xl border border-soil/10 bg-card p-5">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials(review.farmer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{review.farmer.name}</p>
                  <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
                    {format(parseISO(review.createdAt), "MMM d, yyyy")}
                  </time>
                </div>
                <Stars rating={review.rating} />
                {review.comment && <p className="text-sm text-pretty text-muted-foreground">{review.comment}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {meta.totalPages > 1 && (
        <nav aria-label="Review pages" className="flex items-center justify-between gap-3">
          {meta.page > 1 ? (
            <Link href={pageHref(meta.page - 1)} scroll={false} className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              <ChevronLeftIcon data-icon="inline-start" aria-hidden />
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.page < meta.totalPages ? (
            <Link href={pageHref(meta.page + 1)} scroll={false} className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              Older
              <ChevronRightIcon data-icon="inline-end" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  )
}
