import { apiClient } from "@/lib/api/client"

export interface WorkflowStepApprover {
  type?: string
  role?: string
}

export interface WorkflowStep {
  key: string
  name: string
  mode: "sequential" | "parallel"
  approver: WorkflowStepApprover
  requiredApprovals: number
  dueHours: number
}

export interface WorkflowConditions {
  amountGt?: number
  amountLte?: number
  [key: string]: unknown
}

export interface WorkflowRule {
  publicId: string
  orgId: string
  requestTypeId: string
  name: string
  priority: number
  conditions: WorkflowConditions
  workflowDefinition: { steps: WorkflowStep[] }
  escalationHours: number
  active: boolean
  createdAt: string
  updatedAt: string
  requestType?: {
    publicId: string
    key: string
    name: string
    category: string
  }
}

export interface WorkflowRulesResponse {
  statusCode: string
  message: string
  responseBody: { workflowRules: WorkflowRule[] }
}

export interface WorkflowRuleResponse {
  statusCode: string
  message: string
  responseBody: { workflowRule: WorkflowRule }
}

export interface CreateWorkflowRulePayload {
  name: string
  requestTypeKey: string
  priority: number
  conditions: WorkflowConditions
  escalationHours: number
  workflowDefinition: { steps: WorkflowStep[] }
}

export function listWorkflowRules() {
  return apiClient<WorkflowRulesResponse>("/api/v1/workflow-rules")
}

export function getWorkflowRule(publicId: string) {
  return apiClient<WorkflowRuleResponse>(`/api/v1/workflow-rules/${encodeURIComponent(publicId)}`)
}

export interface UpdateWorkflowRulePayload {
  name?: string
  priority?: number
  conditions?: WorkflowConditions
  escalationHours?: number
  active?: boolean
  workflowDefinition?: { steps: WorkflowStep[] }
}

export function createWorkflowRule(payload: CreateWorkflowRulePayload) {
  return apiClient<WorkflowRuleResponse>("/api/v1/workflow-rules", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateWorkflowRule(publicId: string, payload: UpdateWorkflowRulePayload) {
  return apiClient<WorkflowRuleResponse>(`/api/v1/workflow-rules/${encodeURIComponent(publicId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteWorkflowRule(publicId: string) {
  return apiClient<{ statusCode: string; message: string; responseBody: Record<string, unknown> }>(
    `/api/v1/workflow-rules/${encodeURIComponent(publicId)}`,
    { method: "DELETE" }
  )
}
