"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { StarRatingInput } from "@/components/review/star-rating-input"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createReviewSchema, REVIEW_COMMENT_MAX, type ReviewValues } from "@/schemas/review"

export function ReviewForm({
  defaultValues,
  commentRequired,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  defaultValues?: ReviewValues
  commentRequired?: boolean
  submitLabel: string
  pending: boolean
  onSubmit: (values: ReviewValues) => void
  onCancel?: () => void
}) {
  const id = useId()
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(createReviewSchema({ commentRequired })),
    defaultValues: defaultValues ?? { rating: 0, comment: "" },
  })
  const comment = useWatch({ control, name: "comment" }) ?? ""

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field data-invalid={!!errors.rating || undefined}>
        <FieldLabel id={`${id}-rating-label`}>Your rating</FieldLabel>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarRatingInput
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.rating}
              labelledBy={`${id}-rating-label`}
              describedBy={errors.rating ? `${id}-rating-error` : undefined}
            />
          )}
        />
        <FieldError id={`${id}-rating-error`} errors={[errors.rating]} />
      </Field>

      <Field data-invalid={!!errors.comment || undefined}>
        <FieldLabel htmlFor={`${id}-comment`}>
          Comment {!commentRequired && <span className="font-normal text-muted-foreground">(optional)</span>}
        </FieldLabel>
        <Textarea
          id={`${id}-comment`}
          rows={4}
          maxLength={REVIEW_COMMENT_MAX}
          placeholder="Was the chamber at the right temperature? How was the grading and pickup?"
          aria-invalid={!!errors.comment}
          {...register("comment")}
        />
        <div className="flex items-start justify-between gap-3">
          <FieldDescription>Shown publicly on the warehouse page with your name.</FieldDescription>
          <span
            className={cn(
              "shrink-0 text-xs text-muted-foreground tabular-nums",
              comment.length > REVIEW_COMMENT_MAX * 0.9 && "text-harvest-foreground dark:text-harvest"
            )}
          >
            {comment.length}/{REVIEW_COMMENT_MAX}
          </span>
        </div>
        <FieldError errors={[errors.comment]} />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" className="rounded-full" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
