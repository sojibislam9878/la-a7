"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { PencilIcon, StarIcon, Trash2Icon } from "lucide-react"

import { ReviewForm } from "@/components/review/review-form"
import { RATING_LABELS } from "@/components/review/star-rating-input"
import { Stars } from "@/components/review/stars"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useCreateReview, useDeleteReview, useUpdateReview } from "@/hooks/use-reviews"
import type { UpdateReviewPayload } from "@/lib/api/reviews"
import type { ReviewValues } from "@/schemas/review"
import type { Booking, BookingReview as BookingReviewData } from "@/types/booking"

export function BookingReview({ booking }: { booking: Booking }) {
  const [editing, setEditing] = useState(false)
  const create = useCreateReview()
  const update = useUpdateReview()
  const review = booking.review ?? null

  if (booking.status !== "COMPLETED") return null

  if (review && !editing) {
    return <ReviewDisplay booking={booking} review={review} onEdit={() => setEditing(true)} />
  }

  if (review) {
    const save = (values: ReviewValues) => {
      const payload: UpdateReviewPayload = {}
      if (values.rating !== review.rating) payload.rating = values.rating
      if (values.comment && values.comment !== (review.comment ?? "")) payload.comment = values.comment
      if (Object.keys(payload).length === 0) {
        setEditing(false)
        return
      }
      update.mutate({ id: review.id, bookingId: booking.id, payload }, { onSuccess: () => setEditing(false) })
    }

    return (
      <ReviewForm
        defaultValues={{ rating: review.rating, comment: review.comment ?? "" }}
        commentRequired={!!review.comment}
        submitLabel="Save changes"
        pending={update.isPending}
        onSubmit={save}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-3 rounded-2xl bg-harvest/15 p-4 text-sm text-harvest-foreground dark:text-harvest">
        <StarIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        How was your stay at {booking.warehouse.name}? Your rating helps other farmers pick the right storage.
      </p>
      <ReviewForm
        submitLabel="Post review"
        pending={create.isPending}
        onSubmit={({ rating, comment }) =>
          create.mutate({ bookingId: booking.id, rating, ...(comment ? { comment } : {}) })
        }
      />
    </div>
  )
}

function ReviewDisplay({ booking, review, onEdit }: { booking: Booking; review: BookingReviewData; onEdit: () => void }) {
  const remove = useDeleteReview()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Stars rating={review.rating} className="[&_svg]:size-5" />
          <span className="text-sm font-semibold">{RATING_LABELS[review.rating]}</span>
          <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
            · {format(parseISO(review.createdAt), "MMM d, yyyy")}
          </time>
        </div>
        {review.comment ? (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-sm text-pretty text-muted-foreground">
            {review.comment}
          </blockquote>
        ) : (
          <p className="text-sm text-muted-foreground italic">No comment added.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full" onClick={onEdit}>
          <PencilIcon data-icon="inline-start" aria-hidden />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive">
              <Trash2Icon data-icon="inline-start" aria-hidden />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your review?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be removed from {booking.warehouse.name} and their rating will be recalculated. You can write a
                new review for lot {booking.lotCode} later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep review</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => remove.mutate({ id: review.id, bookingId: booking.id })}
              >
                Delete review
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
