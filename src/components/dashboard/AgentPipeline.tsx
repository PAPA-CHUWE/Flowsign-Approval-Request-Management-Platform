"use client"

import { useState, useEffect } from "react"
import { Bot, FileText, Shield, Clock, ArrowRight } from "lucide-react"
import { Loader } from "@/components/loader-ui/loader"
import { runAgentPipeline } from "@/lib/api/modelApi"
import type { AgentPipelineOutput, AgentName } from "@/types/agent.types"

const AGENT_LABELS: Record<AgentName, string> = {
  intake: "Classifier",
  document_understanding: "Document",
  completeness: "Completeness",
  policy: "Policy",
  validation: "Validation",
  risk: "Risk",
  routing: "Routing",
  summary: "Summary",
  notification: "Notification",
  audit: "Audit",
  escalation: "Escalation",
}

const AGENT_ORDER: AgentName[] = [
  "intake",
  "document_understanding",
  "completeness",
  "policy",
  "validation",
  "risk",
  "routing",
  "summary",
  "audit",
]

function AgentStep({
  name,
  status,
  isActive,
  hasOutput,
}: {
  name: AgentName
  status: "pending" | "running" | "completed" | "failed"
  isActive: boolean
  hasOutput: boolean
}) {
  const iconColor =
    status === "completed" ? "text-brand-teal" :
    status === "failed" ? "text-brand-danger-text" :
    status === "running" ? "text-brand-amber" :
    "text-brand-neutral-mid"

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${isActive ? "bg-brand-teal-pale" : "bg-[#F1EFE8]"}`}
      >
        <Bot size={16} className={iconColor} />
      </div>
      <span className="text-[12px] font-medium text-brand-neutral-dark">
        {AGENT_LABELS[name]}
      </span>
    </div>
  )
}

export function AgentPipeline({ requestPublicId }: { requestPublicId: string }) {
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null)
  const [pipeline, setPipeline] = useState<AgentPipelineOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!requestPublicId) return
    setIsLoading(true)
    runAgentPipeline({ request_public_id: requestPublicId })
      .then((result) => {
        if (result) setPipeline(result)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPublicId])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader label="Loading pipeline" />
      </div>
    )
  }

  const mockPipeline: AgentPipelineOutput = pipeline ?? {
    request_reference: requestPublicId,
    request_type: "general",
    status: "pending_approval",
    classification: {
      request_type: "general",
      confidence: 0.94,
      extracted_fields: { title: "Untitled request", priority: "normal" },
      uncertain_fields: [],
      recommended_next_agent: "document_understanding",
    },
    documents: {
      documents_processed: [],
      missing_documents: [],
      document_warnings: [],
      request_document_match: { matches_request: true, reason: "" },
    },
    completeness: {
      is_complete: true,
      completion_score: 0.88,
      missing_fields: [],
      questions_for_requester: [],
    },
    policy: {
      policy_applicable: true,
      policy_checks: [
        { rule: "General requests allow any amount", status: "passed", severity: "info" },
      ],
      required_approvers: ["Manager"],
      required_documents: [],
      policy_summary: "Request complies with general policy.",
    },
    validation: {
      is_valid: true,
      blocking_errors: [],
      warnings: [],
      recommendations: [],
      confidence: 0.92,
    },
    risk: {
      risk_score: 0.15,
      risk_level: "low",
      risk_factors: [],
      recommended_action: "Standard approval process.",
    },
    routing: {
      approver_chain: [
        { role: "Line Manager", order: 1, required: true },
      ],
      sla_hours: 48,
      routing_reason: "General request routed to line manager.",
      confidence: 0.88,
    },
    summary: {
      summary: "This is a general request.",
      key_points: [],
      approver_notes: ["Review and approve if aligned with team objectives."],
      recommended_approver_action: "Approve or request changes.",
    },
    notifications: [],
    audit_events: [],
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[#E8E6DE] bg-white p-5">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-brand-teal" />
        <h3 className="text-[14px] font-semibold text-brand-neutral-dark">
          Agent Pipeline
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {AGENT_ORDER.map((agent) => (
          <AgentStep
            key={agent}
            name={agent}
            status={agent === "intake" || agent === "summary" ? "completed" : "pending"}
            isActive={selectedAgent === agent}
            hasOutput={agent === "intake" || agent === "summary"}
          />
        ))}
      </div>

      <div className="border-t border-[#F1EFE8] pt-4">
        <div className="flex items-start gap-3">
          <Shield size={16} className="mt-0.5 text-brand-teal" />
          <div>
            <p className="text-[13px] font-semibold text-brand-neutral-dark">
              Risk Level: {mockPipeline.risk.risk_level.toUpperCase()}
            </p>
            <p className="text-[11px] text-brand-neutral-mid">
              Risk score: {(mockPipeline.risk.risk_score * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F1EFE8] pt-4">
        <div className="flex items-start gap-3">
          <FileText size={16} className="mt-0.5 text-brand-teal" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-brand-neutral-dark mb-2">
              Request Summary
            </p>
            <p className="text-[12px] text-brand-neutral-mid mb-3">
              {mockPipeline.summary.summary}
            </p>
            {mockPipeline.summary.approver_notes.length > 0 && (
              <p className="text-[11px] text-brand-neutral-mid">
                <span className="font-semibold">Note:</span>{" "}
                {mockPipeline.summary.approver_notes[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#F1EFE8] pt-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-brand-neutral-mid" />
          <span className="text-[11px] text-brand-neutral-mid">
            SLA: {mockPipeline.routing.sla_hours}h
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedAgent("routing")}
          className="flex items-center gap-1 text-[11px] font-medium text-brand-teal hover:underline"
        >
          View routing details
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}