import type { Metadata } from "next"

import { BookingDetail } from "@/components/booking/booking-detail"

export const metadata: Metadata = { title: "Booking details" }

export default async function FarmerBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BookingDetail id={id} />
}
