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
  review?: BookingReview | null
}

export type BookingReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
}

export type CreateBookingPayload = {
  chamberId: string
  cropTypeId: string
  quantityKg: number
  startDate: string
  endDate: string
}

export type BookingSortBy = "createdAt" | "startDate" | "endDate" | "quantityKg"

export type BookingListQuery = {
  status?: BookingStatus
  sortBy?: BookingSortBy
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export type Settlement = {
  billableDays: number
  baseCost: number
  overstayDays: number
  surcharge: number
  finalCost: number
  balance: number
}

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"

export type BookingInvoice = {
  booking: Booking
  charges: {
    quantityKg: number
    ratePerKgPerDay: number
    bookedDays: number
    minBookingDays: number
    estimatedCostBdt: number
    actualDaysStored: number | null
    settlement: Settlement | null
    finalCostBdt: number | null
  }
  payment: {
    id: string
    status: PaymentStatus
    amountBdt: number
    amountCharged: number
    currency: string
    fxRate: number
    paidAt: string | null
  } | null
  balanceBdt: number
}
