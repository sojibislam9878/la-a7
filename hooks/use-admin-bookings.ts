import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { adminApi, type InspectionPayload } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Paginated } from "@/types/api"
import type { Booking, BookingListQuery } from "@/types/booking"

const ADMIN_LISTS = ["bookings", "admin"] as const

export function useAllBookings(query: BookingListQuery) {
  const enabled = useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")

  return useQuery({
    queryKey: queryKeys.adminBookings(query),
    queryFn: async ({ signal }): Promise<Paginated<Booking>> => {
      const result = await adminApi.bookings(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useRecordInspection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["admin", "inspection"],
    mutationFn: async ({ booking, payload }: { booking: Booking; payload: InspectionPayload }) =>
      (await adminApi.recordInspection(booking.id, payload)).data,
    onSuccess: (record, { booking }) => {
      const rejected = record.grade === "REJECTED"
      for (const [key, page] of queryClient.getQueriesData<Paginated<Booking>>({ queryKey: ADMIN_LISTS })) {
        if (!page) continue
        queryClient.setQueryData<Paginated<Booking>>(key, {
          ...page,
          items: page.items.map((item) =>
            item.id === booking.id
              ? {
                  ...item,
                  ...(rejected ? { status: "CANCELLED" as const, cancelReason: "Failed intake quality inspection" } : {}),
                  inspection: {
                    id: record.id,
                    grade: record.grade,
                    actualQtyKg: record.actualQtyKg,
                    moisturePct: record.moisturePct,
                    inspectedAt: record.inspectedAt,
                  },
                }
              : item
          ),
        })
      }
      if (rejected) {
        toast.success(`Lot ${booking.lotCode} rejected at intake`, {
          description: "The booking is cancelled. Refund the farmer from Payments.",
        })
      } else {
        toast.success(`Lot ${booking.lotCode} graded ${record.grade}`, {
          description: "The grade is on the lot record for the owner and farmer.",
        })
      }
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ADMIN_LISTS })
      }
      toast.error("Couldn't record the inspection", { description: getErrorMessage(error) })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStats })
      void queryClient.invalidateQueries({ queryKey: ["admin", "inspections"] })
    },
  })
}
