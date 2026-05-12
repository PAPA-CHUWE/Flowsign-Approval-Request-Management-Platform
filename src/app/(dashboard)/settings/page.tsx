import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/layout/PageHeader"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Settings"
        description="Manage workspace and workflow configuration."
      />
    </DashboardShell>
  )
}
