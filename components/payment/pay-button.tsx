"use client"

import { CreditCardIcon, Loader2Icon, LockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useStartCheckout } from "@/hooks/use-payments"
import { getErrorMessage } from "@/lib/api/form-errors"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PayButton({
  bookingId,
  amount,
  label,
  className,
}: {
  bookingId: string
  amount?: number
  label?: string
  className?: string
}) {
  const checkout = useStartCheckout()
  const redirecting = checkout.isPending || checkout.isSuccess

  return (
    <Button
      size="lg"
      className={cn("h-11 rounded-full", className)}
      disabled={redirecting}
      onClick={() =>
        checkout.mutate(bookingId, {
          onError: (error) => toast.error("Couldn't start the payment", { description: getErrorMessage(error) }),
        })
      }
    >
      {redirecting ? (
        <>
          <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
          Opening secure checkout...
        </>
      ) : (
        <>
          <CreditCardIcon data-icon="inline-start" aria-hidden />
          {label ?? (amount !== undefined ? `Pay ${formatMoney(amount)}` : "Pay now")}
          <LockIcon className="size-3.5 opacity-70" aria-hidden />
        </>
      )}
    </Button>
  )
}
