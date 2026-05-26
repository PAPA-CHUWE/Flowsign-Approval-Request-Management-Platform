"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { EmployeeDashboard } from "./EmployeeDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardRouter() {
  const { user } = useCurrentUser();

  if (!user) return <EmployeeDashboard />;

  const roles = user.roles.map((r) => r.toLowerCase());

  if (roles.includes("org_admin") || roles.includes("it_admin")) {
    return <AdminDashboard />;
  }
  if (roles.includes("manager") || roles.includes("hr")) {
    return <ManagerDashboard />;
  }
  return <EmployeeDashboard />;
}
