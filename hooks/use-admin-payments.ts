import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { adminApi } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney } from "@/lib/format"
import { queryKeys } from "@/lib/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { AdminPayment, AdminPaymentQuery } from "@/types/admin"
import type { Paginated } from "@/types/api"

const ADMIN_PAYMENT_LISTS = ["payments", "admin"] as const

export function useAdminPayments(query: AdminPaymentQuery) {
  const enabled = useAuthStore((state) => state.status === "authenticated" && state.user?.role === "ADMIN")
  return useQuery({
    queryKey: queryKeys.adminPayments(query),
    queryFn: async ({ signal }): Promise<Paginated<AdminPayment>> => {
      const result = await adminApi.payments(query, signal)
      return {
        items: result.data,
        meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length, totalPages: 1 },
      }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useRefundPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["admin", "refund"],
    mutationFn: async ({ payment, reason }: { payment: AdminPayment; reason?: string }) =>
      (await adminApi.refundPayment(payment.id, reason)).data,
    onSuccess: (updated, { payment }) => {
      for (const [key, page] of queryClient.getQueriesData<Paginated<AdminPayment>>({ queryKey: ADMIN_PAYMENT_LISTS })) {
        if (!page) continue
        queryClient.setQueryData<Paginated<AdminPayment>>(key, {
          ...page,
          items: page.items.map((item) =>
            item.id === payment.id
              ? { ...item, status: updated.status, refundedAt: updated.refundedAt, refundable: false }
              : item
          ),
        })
      }
      toast.success(`Refunded ${formatMoney(payment.amountBdt)} to ${payment.booking.farmer.name}`, {
        description: `Lot ${payment.lotCode}. Stripe returns it to the same card in 5 to 10 days.`,
      })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENT_LISTS })
      }
      toast.error("Couldn't refund the payment", { description: getErrorMessage(error) })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments })
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStats })
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] })
    },
  })
}
