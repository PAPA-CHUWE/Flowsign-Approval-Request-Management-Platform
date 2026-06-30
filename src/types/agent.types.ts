export type AgentName =
  | "intake"
  | "document_understanding"
  | "completeness"
  | "policy"
  | "validation"
  | "risk"
  | "routing"
  | "summary"
  | "notification"
  | "audit"
  | "escalation"

export type RequestModule =
  | "general"
  | "petty_cash"
  | "internal_requisition"
  | "loan"
  | "contractor"
  | "fuel"
  | "rfq"

export type RiskLevel = "low" | "medium" | "high"

export type ValidationStatus = "valid" | "invalid" | "needs_review"

export type RequestStatus =
  | "draft"
  | "submitted"
  | "needs_information"
  | "under_validation"
  | "validation_failed"
  | "routed"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "escalated"
  | "implementation_pending"
  | "completed"
  | "cancelled"

export interface ExtractedField {
  name: string
  value: string | number | null
  confidence: number
}

export interface ClassifierOutput {
  request_type: RequestModule
  confidence: number
  extracted_fields: Record<string, string | number | null>
  uncertain_fields: string[]
  recommended_next_agent: AgentName
  request_reference?: string
}

export interface DocumentProcessed {
  file_name: string
  document_type: string
  status: "processed" | "unsupported" | "failed"
  extracted_fields: Record<string, string | number | null>
  confidence: number
  warning?: string
}

export interface DocumentUnderstandingOutput {
  documents_processed: DocumentProcessed[]
  missing_documents: string[]
  document_warnings: string[]
  request_document_match: {
    matches_request: boolean
    reason: string
  }
}

export interface CompletenessOutput {
  is_complete: boolean
  completion_score: number
  missing_fields: string[]
  questions_for_requester: string[]
  suggested_improved_description?: string
}

export interface PolicyCheck {
  rule: string
  status: "passed" | "failed" | "warning"
  severity: "blocking" | "info" | "warning"
}

export interface PolicyOutput {
  policy_applicable: boolean
  policy_checks: PolicyCheck[]
  required_approvers: string[]
  required_documents: string[]
  policy_summary: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationOutput {
  is_valid: boolean
  blocking_errors: string[]
  warnings: string[]
  recommendations: string[]
  confidence: number
}

export interface RiskAssessmentOutput {
  risk_score: number
  risk_level: RiskLevel
  risk_factors: string[]
  recommended_action: string
}

export interface ApproverChainItem {
  role: string
  order: number
  required: boolean
}

export interface RoutingOutput {
  approver_chain: ApproverChainItem[]
  sla_hours: number
  routing_reason: string
  confidence: number
}

export interface SummaryOutput {
  summary: string
  key_points: string[]
  approver_notes: string[]
  recommended_approver_action: string
}

export interface NotificationOutput {
  notification_type: "validation_failed" | "missing_information" | "routed" | "approved" | "rejected" | "escalated"
  recipient_role: "Requester" | "Approver" | "Admin"
  subject: string
  message: string
}

export interface AuditEvent {
  request_reference: string
  agent_name: AgentName
  timestamp: string
  action: string
  decision: string
  confidence: number
  summary: string
  next_action?: string
  warnings?: string[]
  errors?: string[]
}

export interface EscalationOutput {
  should_escalate: boolean
  reason: string
  current_approver?: string
  next_escalation_role?: string
  notification_required: boolean
}

export interface AgentPipelineOutput {
  request_reference: string
  request_type: RequestModule
  status: RequestStatus
  classification: ClassifierOutput
  documents: DocumentUnderstandingOutput
  completeness: CompletenessOutput
  policy: PolicyOutput
  validation: ValidationOutput
  risk: RiskAssessmentOutput
  routing: RoutingOutput
  summary: SummaryOutput
  notifications: NotificationOutput[]
  audit_events: AuditEvent[]
}

export interface CreateAgentRunPayload {
  request_public_id: string
  force_re_run?: boolean
}

export interface AgentRunResponse {
  statusCode: string
  message: string
  responseBody: {
    pipeline: AgentPipelineOutput
  }
}