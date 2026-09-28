export type BookingStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "PAID"
  | "STORED"
  | "WITHDRAW_REQUESTED"
  | "COMPLETED"
  | "EXPIRED"

export type Booking = {
  id: string
  lotCode: string
  status: BookingStatus
  quantityKg: number
  startDate: string
  endDate: string
  bookedDays: number
  ratePerKgPerDay: number
  estimatedCost: number
  finalCost: number | null
  holdExpiresAt: string | null
  storedAt: string | null
  withdrawnAt: string | null
  cancelReason: string | null
  createdAt: string
  cropType: { id: string; name: string }
  chamber: { id: string; name: string; minTempC: number; maxTempC: number }
  warehouse: { id: string; name: string; district: string }
  farmer: { id: string; name: string; phone: string | null }
}

export type CreateBookingPayload = {
  chamberId: string
  cropTypeId: string
  quantityKg: number
  startDate: string
  endDate: string
}
