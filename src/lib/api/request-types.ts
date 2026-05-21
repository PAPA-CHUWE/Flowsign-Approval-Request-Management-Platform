import { apiClient } from "@/lib/api/client"

export interface RequestTypeField {
  key: string
  label: string
  type: "string" | "number" | "date" | string
  required: boolean
  helpText?: string
}

export interface RequestTypeSchema {
  version: number
  fields: RequestTypeField[]
  required: string[]
}

export interface OrganizationRequestType {
  publicId: string
  key: string
  name: string
  category: string
  description: string
  schema: RequestTypeSchema
  fields: RequestTypeField[]
  required: string[]
  system: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface RequestTypesResponse {
  statusCode: string
  message: string
  responseBody: {
    requestTypes: OrganizationRequestType[]
  }
}

export interface CreateRequestTypePayload {
  key: string
  name: string
  category: string
  description: string
  fields: RequestTypeField[]
  schema: RequestTypeSchema
  active: boolean
}

export interface CreateRequestTypeResponse {
  statusCode: string
  message: string
  responseBody: {
    requestType: OrganizationRequestType
  }
}

export interface RequestTypeDetailsResponse {
  statusCode: string
  message: string
  responseBody: {
    requestType: OrganizationRequestType
  }
}

export function listRequestTypes() {
  return apiClient<RequestTypesResponse>("/api/v1/request-types")
}

export function getRequestType(key: string) {
  return apiClient<RequestTypeDetailsResponse>(
    `/api/v1/request-types/${encodeURIComponent(key)}`
  )
}

export function createRequestType(payload: CreateRequestTypePayload) {
  return apiClient<CreateRequestTypeResponse>("/api/v1/request-types", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
