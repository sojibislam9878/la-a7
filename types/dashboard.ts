export type FarmerDashboard = {
  role: "FARMER"
  profileComplete: boolean
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalSpentBdt: number
}

export type OwnerDashboard = {
  role: "WAREHOUSE_OWNER"
  profileComplete: boolean
  totalWarehouses: number
  approvedWarehouses: number
  totalChambers: number
  bookingsAwaitingApproval: number
}

export type AdminDashboard = {
  role: "ADMIN"
  profileComplete: boolean
  totalUsers: number
  warehousesAwaitingApproval: number
  totalBookings: number
  platformRevenueBdt: number
}

export type DashboardSummary = FarmerDashboard | OwnerDashboard | AdminDashboard
