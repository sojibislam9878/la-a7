import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { type CreateReviewPayload, reviewsApi, type UpdateReviewPayload } from "@/lib/api/reviews"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated } from "@/types/api"
import type { Booking, BookingReview } from "@/types/booking"
import type { Review } from "@/types/warehouse"

function setBookingReview(queryClient: QueryClient, bookingId: string, review: BookingReview | null) {
  queryClient.setQueryData<Booking>(queryKeys.booking(bookingId), (booking) => (booking ? { ...booking, review } : booking))
  for (const [key, page] of queryClient.getQueriesData<Paginated<Booking>>({ queryKey: ["bookings", "mine"] })) {
    if (!page) continue
    queryClient.setQueryData<Paginated<Booking>>(key, {
      ...page,
      items: page.items.map((booking) => (booking.id === bookingId ? { ...booking, review } : booking)),
    })
  }
}

const toBookingReview = ({ id, rating, comment, createdAt }: Review): BookingReview => ({ id, rating, comment, createdAt })

function refresh(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["reviews", "create"],
    mutationFn: async (payload: CreateReviewPayload) => (await reviewsApi.create(payload)).data,
    onSuccess: (review, { bookingId }) => {
      setBookingReview(queryClient, bookingId, toBookingReview(review))
      toast.success("Thanks for your review", { description: "It now shows on the warehouse page." })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) refresh(queryClient)
      toast.error("Couldn't post your review", { description: getErrorMessage(error) })
    },
    onSettled: () => refresh(queryClient),
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["reviews", "update"],
    mutationFn: async ({ id, payload }: { id: string; bookingId: string; payload: UpdateReviewPayload }) =>
      (await reviewsApi.update(id, payload)).data,
    onSuccess: (review, { bookingId }) => {
      setBookingReview(queryClient, bookingId, toBookingReview(review))
      toast.success("Review updated")
    },
    onError: (error) => {
      toast.error("Couldn't update your review", { description: getErrorMessage(error) })
    },
    onSettled: () => refresh(queryClient),
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["reviews", "delete"],
    mutationFn: async ({ id }: { id: string; bookingId: string }) => {
      await reviewsApi.remove(id)
    },
    onMutate: async ({ bookingId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings })
      const previous = queryClient.getQueryData<Booking>(queryKeys.booking(bookingId))?.review
      const fromList = queryClient
        .getQueriesData<Paginated<Booking>>({ queryKey: ["bookings", "mine"] })
        .flatMap(([, page]) => page?.items ?? [])
        .find((booking) => booking.id === bookingId)?.review
      setBookingReview(queryClient, bookingId, null)
      return { previous: previous ?? fromList ?? null }
    },
    onSuccess: () => {
      toast.success("Review deleted", { description: "You can write a new one any time." })
    },
    onError: (error, { bookingId }, context) => {
      if (context?.previous) setBookingReview(queryClient, bookingId, context.previous)
      toast.error("Couldn't delete your review", { description: getErrorMessage(error) })
    },
    onSettled: () => refresh(queryClient),
  })
}
