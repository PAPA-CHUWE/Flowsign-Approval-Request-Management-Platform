const DEFAULT_API_BASE_URL =
  "https://flowsign-approval-request-management-2ss4.onrender.com"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL
const AUTH_TOKEN_KEY = "flowsign_auth_token"

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    return response.json()
  }

  const text = await response.text()
  return text || undefined
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

export async function apiClient<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  const headers = new Headers(init?.headers)
  const token = getStoredToken()

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers,
  })
  const body = await readResponseBody(response)

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `API request failed: ${response.status}`

    if (response.status === 401 && typeof window !== "undefined") {
      const AUTH_PATHS = ["/login", "/signup", "/forgot-password"]
      const onAuthPage = AUTH_PATHS.some(
        (p) => window.location.pathname === p || window.location.pathname.startsWith(p + "/")
      )
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
      document.cookie = "flowsign_auth=; path=/; SameSite=Lax; max-age=0"
      if (!onAuthPage) {
        window.location.href = "/login"
      }
    }

    throw new ApiError(message, response.status, body)
  }

  return body as TResponse
}
