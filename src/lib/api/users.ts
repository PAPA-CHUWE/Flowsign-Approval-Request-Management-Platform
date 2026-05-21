import { apiClient } from "@/lib/api/client"

export interface OrganizationUser {
  publicId: string
  email: string
  firstName: string
  lastName: string
  status: string
  roles: string[]
  department?: string | null
  title?: string | null
  phoneNumber?: string | null
  lastLoginAt?: string | null
  createdAt?: string | null
}

export interface UsersResponse {
  statusCode: string
  message: string
  responseBody: {
    users: OrganizationUser[]
  }
}

export interface UserResponse {
  statusCode: string
  message: string
  responseBody: {
    user: OrganizationUser
  }
}

export interface InviteUserPayload {
  email: string
  firstName: string
  lastName: string
  department?: string
  title?: string
  roles: string[]
}

export type InviteUserResponse = UserResponse

export interface DeleteUserResponse {
  statusCode: string
  message: string
  responseBody: {
    deleted: boolean
  }
}

export interface UpdateUserStatusPayload {
  status: string
}

export type UpdateUserStatusResponse = UserResponse

export interface UpdateUserRolesPayload {
  roles: string[]
}

export type UpdateUserRolesResponse = UserResponse

export function listOrganizationUsers() {
  return apiClient<UsersResponse>("/api/v1/users")
}

export function getOrganizationUser(publicId: string) {
  return apiClient<UserResponse>(`/api/v1/users/${publicId}`)
}

export function inviteUser(payload: InviteUserPayload) {
  return apiClient<InviteUserResponse>("/api/v1/users/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function deleteOrganizationUser(publicId: string) {
  return apiClient<DeleteUserResponse>(`/api/v1/users/${publicId}`, {
    method: "DELETE",
  })
}

export function updateUserStatus(
  publicId: string,
  payload: UpdateUserStatusPayload
) {
  return apiClient<UpdateUserStatusResponse>(`/api/v1/users/${publicId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function updateUserRoles(
  publicId: string,
  payload: UpdateUserRolesPayload
) {
  return apiClient<UpdateUserRolesResponse>(`/api/v1/users/${publicId}/roles`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
