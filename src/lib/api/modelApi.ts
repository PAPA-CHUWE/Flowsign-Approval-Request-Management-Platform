import { apiClient } from "./client";

export interface AgentClassification {
  request_type_key: string;
  priority: string;
  department: string | null;
  suggested_fields?: Record<string, string>;
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
