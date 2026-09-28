export type Role = "FARMER" | "WAREHOUSE_OWNER" | "ADMIN"

export type SelfServiceRole = Exclude<Role, "ADMIN">

export type AccountStatus = "ACTIVE" | "BANNED"

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: AccountStatus
  createdAt: string
  profileComplete: boolean
}
