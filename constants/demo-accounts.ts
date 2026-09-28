import type { Role } from "@/types/user"

export type DemoAccount = {
  role: Role
  email: string
  password: string
  description: string
}

/** Seeded, pre-verified accounts from backend/prisma/seed.ts, for evaluation */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "FARMER",
    email: "farmer1@gmail.com",
    password: "f12345678",
    description: "Search, book, pay and review",
  },
  {
    role: "WAREHOUSE_OWNER",
    email: "warehouse1@gmail.com",
    password: "w12345678",
    description: "Manage chambers and bookings",
  },
  {
    role: "ADMIN",
    email: "admin@gmail.com",
    password: "12345678",
    description: "Approve, inspect and oversee",
  },
]
