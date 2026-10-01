"use client"

import dynamic from "next/dynamic"

import { FormSkeleton } from "@/components/shared/form-skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CropType } from "@/types/crop-type"
import type { Chamber } from "@/types/warehouse"

const ChamberForm = dynamic(() => import("@/components/owner/chambers/chamber-form").then((m) => m.ChamberForm), {
  loading: () => <FormSkeleton fields={4} />,
})

export function ChamberFormDialog({
  warehouseId,
  chamber,
  cropTypes,
  open,
  onOpenChange,
}: {
  warehouseId: string
  chamber?: Chamber
  cropTypes: CropType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{chamber ? `Edit chamber ${chamber.name}` : "Add a chamber"}</DialogTitle>
          <DialogDescription>
            The temperature range decides which crops farmers can store here.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ChamberForm
            key={chamber?.id ?? "new"}
            warehouseId={warehouseId}
            chamber={chamber}
            cropTypes={cropTypes}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
