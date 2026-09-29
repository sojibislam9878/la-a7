import type { Metadata } from "next"

import { BookingInvoiceView } from "@/components/booking/booking-invoice-view"

export const metadata: Metadata = { title: "Invoice" }

export default async function BookingInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BookingInvoiceView id={id} />
}
