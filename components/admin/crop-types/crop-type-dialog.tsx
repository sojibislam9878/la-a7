"use client"

import dynamic from "next/dynamic"

import { FormSkeleton } from "@/components/shared/form-skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CropType } from "@/types/crop-type"

const CropTypeForm = dynamic(() => import("@/components/admin/crop-types/crop-type-form").then((m) => m.CropTypeForm), {
  loading: () => <FormSkeleton fields={4} />,
})

export function CropTypeDialog({
  crop,
  open,
  onOpenChange,
}: {
  crop?: CropType
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{crop ? `Edit ${crop.name}` : "Add a crop type"}</DialogTitle>
          <DialogDescription>
            A chamber can store this crop only when its temperature range covers the crop&apos;s ideal range.
          </DialogDescription>
        </DialogHeader>
        {open && <CropTypeForm key={crop?.id ?? "new"} crop={crop} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
