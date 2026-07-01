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

const MOCK_CLASSIFY_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /(leave|vacation|pto|sick|time.?off)/i, type: "leave" },
  { pattern: /(procure|purchase|buy|order|vendor|quote|invoice)/i, type: "procurement" },
  { pattern: /(laptop|macbook|monitor|equipment|hardware|software|computer|it\s*equipment)/i, type: "it_equipment" },
  { pattern: /(budget|fund|finance|payment|expense|\$\d+)/i, type: "finance" },
  { pattern: /(facility|office|desk|maintenance|repair|cleaning|furniture)/i, type: "facilities" },
  { pattern: /(hiring|recruit|onboard|contract|employee|job|candidate)/i, type: "hr" },
  { pattern: /(travel|flight|hotel|trip|conference|site\s*visit|bulawayo|harare)/i, type: "travel" },
]

const extractAmountForSuggest = (text: string): number | null => {
  const patterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d+)\s*(dollars|usd)/i,
    /(?<![a-zA-Z0-9])(\d{3,})(?![a-zA-Z0-9])/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return parseFloat(m[1].replace(/,/g, ""))
  }
  return null
}

function mockAISuggest(input: AISuggestInput): AIAgentDecision {
  const combined = `${input.title} ${input.description ?? ""}`
  const match = MOCK_CLASSIFY_PATTERNS.find((p) => p.pattern.test(combined)) ?? MOCK_CLASSIFY_PATTERNS[MOCK_CLASSIFY_PATTERNS.length - 1]
  const amount = extractAmountForSuggest(combined)

  const classification: AgentClassification = {
    request_type_key: match.type,
    priority: /urgent|asap|immediately|critical|emergency/i.test(combined) ? "urgent" : "normal",
    department: null,
    suggested_fields: amount ? { amount } : undefined,
    confidence: 0.85,
    reasoning: "Keyword-based classification",
  }

  const validation: AgentValidation = {
    valid: true,
    warnings: amount && amount > 10000 ? [`Large amount $${amount} requires review`] : [],
    recommendations: [],
    confidence: 0.9,
  }

  const routing: AgentRouting = {
    recommended_approver: amount && amount >= 50000 ? "org_admin" :
      amount && amount >= 10000 ? "finance" :
      /travel|site\s*visit/i.test(combined) ? "manager" :
      "manager",
    backup_approver: "manager",
    confidence: 0.85,
    reasoning: "Default routing based on request type",
  }

  return { classification, validation, routing }
}

export async function aiSuggest(input: AISuggestInput): Promise<AIAgentDecision | null> {
  try {
    const json = await apiClient<AIResponse>("/api/v1/ai/orchestrate", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return json.responseBody?.decision ?? mockAISuggest(input);
  } catch {
    return mockAISuggest(input);
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
    return json.responseBody?.description ?? mockGenerateDescription(title, requestTypeKey);
  } catch {
    return mockGenerateDescription(title, requestTypeKey);
  }
}

function mockGenerateDescription(title: string, requestTypeKey?: string): string {
  const typeLabel = requestTypeKey ? ` ${requestTypeKey}` : ""
  return `I am requesting approval for${typeLabel} ${title.toLowerCase()}. This request is being submitted to support ongoing operational activities within the organization. Please review and approve this request at your earliest convenience to ensure timely execution.`
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