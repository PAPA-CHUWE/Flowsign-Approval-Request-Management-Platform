export const USER_ROLE = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]
