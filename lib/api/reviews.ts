import { authedRequest } from "@/lib/api/authed"
import type { Review } from "@/types/warehouse"

export type CreateReviewPayload = { bookingId: string; rating: number; comment?: string }
export type UpdateReviewPayload = { rating?: number; comment?: string }

export const reviewsApi = {
  create: (payload: CreateReviewPayload) => authedRequest<Review>("/reviews", { method: "POST", body: payload }),
  update: (id: string, payload: UpdateReviewPayload) =>
    authedRequest<Review>(`/reviews/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => authedRequest<null>(`/reviews/${id}`, { method: "DELETE" }),
}
