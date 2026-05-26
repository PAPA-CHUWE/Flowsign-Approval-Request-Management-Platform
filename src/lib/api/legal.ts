import { apiClient } from "@/lib/api/client"

export interface LegalDocument {
  title: string
  version: string
  effectiveDate: string
  content: string
}

interface LegalResponse {
  statusCode: string
  message: string
  responseBody: {
    data: LegalDocument
  }
}

export function getTermsOfService(): Promise<LegalDocument> {
  return apiClient<LegalResponse>("/api/v1/legal/terms-of-service").then(
    (res) => res.responseBody.data
  )
}

export function getPrivacyPolicy(): Promise<LegalDocument> {
  return apiClient<LegalResponse>("/api/v1/legal/privacy-policy").then(
    (res) => res.responseBody.data
  )
}
