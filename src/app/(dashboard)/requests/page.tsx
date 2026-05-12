import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/layout/PageHeader"
import { RequestFormShell } from "@/components/request-form/RequestFormShell"

export default function RequestsPage() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <PageHeader
          title="Requests"
          description="Create and submit a new workflow request."
        />
        <RequestFormShell />
      </div>
    </DashboardShell>
  )
}
