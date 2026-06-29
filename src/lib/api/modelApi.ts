const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const AUTH_TOKEN_KEY = "flowsign_auth_token";

export interface AgentClassification {
  request_type_key: string;
  priority: string;
  department: string | null;
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
  requestTypeKey?: string;
}

export async function aiSuggest(input: AISuggestInput): Promise<AIAgentDecision | null> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/api/v1/ai/orchestrate`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) return null;

    const json = await response.json();
    return json.data?.decision ?? null;
  } catch {
    return null;
  }
}
