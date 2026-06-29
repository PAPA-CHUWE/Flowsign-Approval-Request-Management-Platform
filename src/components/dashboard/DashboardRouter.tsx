"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { resolveNavRole } from "@/lib/auth-utils";
import { USER_ROLE } from "@/constants/role.constants";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardRouter() {
  const { user } = useCurrentUser();

  if (!user) return <EmployeeDashboard />;

  const role = resolveNavRole(user, USER_ROLE.EMPLOYEE);

  if (role === USER_ROLE.ADMIN) {
    return <AdminDashboard />;
  }
  if (role === USER_ROLE.MANAGER) {
    return <ManagerDashboard />;
  }
  return <EmployeeDashboard />;
}
