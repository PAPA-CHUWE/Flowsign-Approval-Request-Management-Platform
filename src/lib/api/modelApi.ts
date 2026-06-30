import { apiClient } from "./client";
import type {
  AgentPipelineOutput,
  CreateAgentRunPayload,
  AgentRunResponse,
  ClassifierOutput,
  DocumentUnderstandingOutput,
  CompletenessOutput,
  PolicyOutput,
  ValidationOutput,
  RiskAssessmentOutput,
  RoutingOutput,
  SummaryOutput,
  AuditEvent,
  AgentName,
} from "@/types/agent.types"

export interface AgentClassification {
  request_type_key: string;
  priority: string;
  department: string | null;
  suggested_fields?: Record<string, string | number>;
  confidence: number;
  reasoning: string;
}

export interface AgentValidation {
  valid: boolean;
  warnings: string[];
  recommendations: string[];
  confidence: number;
}

export interface AgentRouting {
  recommended_approver: string | null;
  backup_approver: string | null;
  confidence: number;
  reasoning: string;
}

export interface AIAgentDecision {
  classification: AgentClassification | null;
  validation: AgentValidation | null;
  routing: AgentRouting | null;
}

export interface AISuggestInput {
  title: string;
  description?: string;
  data?: Record<string, unknown>;
  fieldDefinitions?: Record<string, unknown>[];
  requestTypeKey?: string;
}

interface AIResponse {
  statusCode: string;
  message: string;
  responseBody: {
    decision: AIAgentDecision | null;
  };
}

export async function aiSuggest(input: AISuggestInput): Promise<AIAgentDecision | null> {
  try {
    const json = await apiClient<AIResponse>("/api/v1/ai/orchestrate", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return json.responseBody?.decision ?? null;
  } catch {
    return null;
  }
}

interface GenerateDescriptionResponse {
  statusCode: string;
  responseBody: {
    description: string | null;
  };
}

export async function aiGenerateDescription(title: string, requestTypeKey?: string): Promise<string | null> {
  try {
    const json = await apiClient<GenerateDescriptionResponse>("/api/v1/ai/generate-description", {
      method: "POST",
      body: JSON.stringify({ title, requestTypeKey }),
    });
    return json.responseBody?.description ?? null;
  } catch {
    return null;
  }
}

export interface SynthesizeInput {
  text: string;
  fieldDefinitions?: Record<string, unknown>[];
}

export interface SynthesizeResult {
  title: string;
  description: string;
  request_type_key: string;
  priority: string;
  department: string | null;
  suggested_fields?: Record<string, string | number>;
  recommended_approver: string | null;
  backup_approver: string | null;
}

interface SynthesizeResponse {
  statusCode: string;
  message: string;
  responseBody: SynthesizeResult;
}

export async function aiSynthesize(input: SynthesizeInput): Promise<SynthesizeResult | null> {
  try {
    const json = await apiClient<SynthesizeResponse>("/api/v1/ai/synthesize", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return json.responseBody ?? null;
  } catch {
    return null;
  }
}

// ── Agent Pipeline API Functions ─────────────────────────────────────────────────

export function runAgentPipeline(payload: CreateAgentRunPayload): Promise<AgentPipelineOutput | null> {
  return apiClient<AgentRunResponse>("/api/v1/ai/pipeline", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.responseBody?.pipeline ?? null).catch(() => null)
}

export function getAgentOutput(
  requestPublicId: string,
  agentName: AgentName
): Promise<ClassifierOutput | DocumentUnderstandingOutput | CompletenessOutput | PolicyOutput | ValidationOutput | RiskAssessmentOutput | RoutingOutput | SummaryOutput | null> {
  return apiClient<{
    statusCode: string
    message: string
    responseBody: { output: ClassifierOutput | DocumentUnderstandingOutput | CompletenessOutput | PolicyOutput | ValidationOutput | RiskAssessmentOutput | RoutingOutput | SummaryOutput | null }
  }>(`/api/v1/ai/output/${encodeURIComponent(requestPublicId)}/${agentName}`)
    .then((r) => r.responseBody?.output ?? null)
    .catch(() => null)
}

export function getAuditTrail(requestPublicId: string): Promise<AuditEvent[]> {
  return apiClient<{
    statusCode: string
    message: string
    responseBody: { events: AuditEvent[] }
  }>(`/api/v1/audit/${encodeURIComponent(requestPublicId)}`)
    .then((r) => r.responseBody?.events ?? [])
    .catch(() => [])
}