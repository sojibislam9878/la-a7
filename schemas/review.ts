import { z } from "zod"

export const REVIEW_COMMENT_MAX = 1000

export function createReviewSchema({ commentRequired = false }: { commentRequired?: boolean } = {}) {
  return z.object({
    rating: z
      .number({ error: "Choose a star rating" })
      .int()
      .min(1, { error: "Choose a star rating" })
      .max(5, { error: "Choose a star rating" }),
    comment: z
      .string()
      .trim()
      .max(REVIEW_COMMENT_MAX, { error: `Keep it under ${REVIEW_COMMENT_MAX} characters` })
      .refine((value) => (commentRequired ? value.length >= 3 : value.length === 0 || value.length >= 3), {
        error: commentRequired
          ? "A comment can be changed but not removed. Write at least 3 characters."
          : "Write at least 3 characters, or leave it empty",
      }),
  })
}

export type ReviewValues = z.infer<ReturnType<typeof createReviewSchema>>
