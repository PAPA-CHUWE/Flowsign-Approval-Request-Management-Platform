import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/layout/PageHeader"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Track request activity and approval health."
      />
    </DashboardShell>
  )
}
