"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ClipboardCheckIcon } from "lucide-react"

import { FormSkeleton } from "@/components/shared/form-skeleton"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Booking } from "@/types/booking"

const InspectionForm = dynamic(() => import("@/components/admin/bookings/inspection-form").then((m) => m.InspectionForm), {
  loading: () => <FormSkeleton fields={4} />,
})

export function InspectionDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <ClipboardCheckIcon data-icon="inline-start" aria-hidden />
          Record inspection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Intake inspection, lot {booking.lotCode}</DialogTitle>
          <DialogDescription>
            {booking.cropType.name} from {booking.farmer.name}, arriving at {booking.warehouse.name}. A lot can only be
            inspected once.
          </DialogDescription>
        </DialogHeader>
        {open && <InspectionForm booking={booking} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
