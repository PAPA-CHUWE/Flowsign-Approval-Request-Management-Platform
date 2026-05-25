import { apiClient } from "@/lib/api/client"

export const AUTH_TOKEN_KEY = "flowsign_auth_token"
export const AUTH_USER_KEY = "flowsign_auth_user"
export const AUTH_SESSION_CHANGE_EVENT = "flowsign_auth_session_change"
export const AUTH_COOKIE_NAME = "flowsign_auth"

function setAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; SameSite=Lax; max-age=86400`
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0`
}

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
  setAuthCookie()
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  statusCode: string
  message: string
  responseBody: { ok: boolean }
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ForgotPasswordResponse {
  statusCode: string
  message: string
  responseBody: { ok: boolean }
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient<ForgotPasswordResponse>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiClient<ChangePasswordResponse>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// ── Accept invite ─────────────────────────────────────────────────────────────

export interface AcceptInvitePayload {
  token: string
  password: string
  firstName?: string
  lastName?: string
}

interface AcceptInviteRawResponse {
  status: number
  message: string
  data: {
    token: string
    user: AuthUser
  }
}

export async function acceptInvite(payload: AcceptInvitePayload): Promise<AuthUser> {
  const res = await apiClient<AcceptInviteRawResponse>("/api/v1/auth/accept-invite", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_KEY, res.data.token)
    storeAuthUser(res.data.user)
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; SameSite=Lax; max-age=86400`
  }
  return res.data.user
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  clearAuthCookie()
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT))
}
