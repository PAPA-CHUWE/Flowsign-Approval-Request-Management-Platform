import { PageHeader } from "@/components/layout/PageHeader"
import { WorkflowRulesContent } from "@/components/workflow-rules/WorkflowRulesContent"

export default function WorkflowRulesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Workflow Rules"
        description="Define approval chains for each request type. Rules are matched by request type and conditions."
      />
      <WorkflowRulesContent />
    </div>
  )
}
