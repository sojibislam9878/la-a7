"use client"

import dynamic from "next/dynamic"

import { FormSkeleton } from "@/components/shared/form-skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Warehouse } from "@/types/warehouse"

const CreateBody = dynamic(() => import("@/components/owner/warehouses/warehouse-form").then((m) => m.CreateBody), {
  loading: () => <FormSkeleton fields={6} />,
})

const EditBody = dynamic(() => import("@/components/owner/warehouses/warehouse-form").then((m) => m.EditBody), {
  loading: () => <FormSkeleton fields={6} />,
})

export function WarehouseFormDialog({
  warehouse,
  open,
  onOpenChange,
}: {
  warehouse?: Warehouse
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const editing = !!warehouse

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{editing ? `Edit ${warehouse.name}` : "Add a warehouse"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes to a live warehouse show on its listing straight away."
              : "New warehouses are reviewed by an admin before farmers can book them."}
          </DialogDescription>
        </DialogHeader>
        {open &&
          (editing ? (
            <EditBody warehouse={warehouse} onDone={() => onOpenChange(false)} />
          ) : (
            <CreateBody onDone={() => onOpenChange(false)} />
          ))}
      </DialogContent>
    </Dialog>
  )
}
