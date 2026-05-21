import { apiClient } from "@/lib/api/client"

export const AUTH_TOKEN_KEY = "flowsign_auth_token"
export const AUTH_USER_KEY = "flowsign_auth_user"
export const AUTH_SESSION_CHANGE_EVENT = "flowsign_auth_session_change"

export interface SignupPayload {
  organizationName: string
  organizationSlug: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  organizationSlug: string
  email: string
  password: string
}

export interface AuthUser {
  publicId: string
  email: string
  firstName: string
  lastName: string
  organization: {
    publicId: string
    name: string
    slug: string
  }
  roles: string[]
  permissions: string[]
}

export interface AuthResponse {
  statusCode: string
  message: string
  responseBody: {
    token: string
    user: AuthUser
  }
}

export interface CurrentUserResponse {
  statusCode: string
  message: string
  responseBody: {
    user: AuthUser
  }
}

export interface LogoutResponse {
  statusCode: string
  message: string
  responseBody: {
    ok: boolean
  }
}

export function signup(payload: SignupPayload) {
  return apiClient<AuthResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function login(payload: LoginPayload) {
  return apiClient<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser() {
  return apiClient<CurrentUserResponse>("/api/v1/auth/me")
}

export function logout() {
  return apiClient<LogoutResponse>("/api/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}

export function readStoredAuthUser() {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.localStorage.getItem(AUTH_USER_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as AuthUser
  } catch {
    return null
  }
}

export function storeAuthUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))
}

export function storeAuthSession(response: AuthResponse) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, response.responseBody.token)
  storeAuthUser(response.responseBody.user)
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))
}
