import type { UserRole } from "@/constants/role.constants"

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
}
