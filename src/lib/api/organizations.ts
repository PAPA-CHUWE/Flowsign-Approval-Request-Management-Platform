import { apiClient } from "@/lib/api/client"

export interface OrganizationAddress {
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

export interface OrganizationProfile {
  legalName: string | null
  displayName: string | null
  industry: string | null
  companySize: string | null
  website: string | null
  workEmail: string | null
  phoneNumber: string | null
  fax: string | null
  timezone: string
  locale: string
  currency: string
  address: OrganizationAddress
}

export interface NotificationChannelSetting {
  inApp: boolean
  email: boolean
  sms: boolean
}

export interface OrganizationNotificationSettings {
  defaultChannels: NotificationChannelSetting
  events: {
    approvals: NotificationChannelSetting
    mentions: NotificationChannelSetting
    reminders: NotificationChannelSetting
    statusUpdates: NotificationChannelSetting
    comments: NotificationChannelSetting
    escalations: NotificationChannelSetting
  }
  reminderHours: number[]
}

export interface OrganizationBrandingSettings {
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  useCustomBranding: boolean
  supportEmail: string | null
}

export interface OrganizationSecuritySettings {
  enforceMfa: boolean
  allowedDomains: string[]
  sessionTimeoutMinutes: number
  passwordMinLength: number
  ssoEnabled: boolean
  ssoProvider: string | null
}

export interface OrganizationWorkflowSettings {
  defaultEscalationHours: number
  defaultReminderHours: number
  allowDelegation: boolean
  requireRejectionReason: boolean
}

export interface OrganizationFeatureSettings {
  workflowBuilder: boolean
  customRequestTypes: boolean
  analytics: boolean
  auditExports: boolean
  webhooks: boolean
  multiCurrency: boolean
  delegation: boolean
  escalations: boolean
}

export interface OrganizationIntegrationsSettings {
  webhooks: unknown[]
}

export type UpdateOrganizationSecuritySettingsPayload = Pick<
  OrganizationSecuritySettings,
  "enforceMfa" | "allowedDomains" | "sessionTimeoutMinutes" | "ssoEnabled" | "ssoProvider"
>

export interface OrganizationSettings {
  profile: OrganizationProfile
  branding: OrganizationBrandingSettings
  notifications: OrganizationNotificationSettings
  security: OrganizationSecuritySettings
  workflow: OrganizationWorkflowSettings
  features: OrganizationFeatureSettings
  integrations: OrganizationIntegrationsSettings
}

export interface CurrentOrganization {
  publicId: string
  name: string
  slug: string
  profile: OrganizationProfile
  settings: OrganizationSettings
  createdAt: string
  updatedAt: string
}

export interface CurrentOrganizationResponse {
  statusCode: string
  message: string
  responseBody: {
    organization: CurrentOrganization
  }
}

export interface CurrentOrganizationSettingsResponse {
  statusCode: string
  message: string
  responseBody: {
    settings: OrganizationSettings
  }
}

export interface UpdateOrganizationPayload {
  name: string
  slug: string
  profile: {
    displayName: string | null
    legalName: string | null
    industry: string | null
    companySize: string | null
    website: string | null
    workEmail: string | null
    phoneNumber: string | null
    fax: string | null
    timezone: string
    locale: string
    currency: string
  }
  settings?: Record<string, unknown>
}

export interface UpdateOrganizationProfilePayload {
  name: string
  slug: string
  profile: {
    legalName: string | null
    industry: string | null
    website: string | null
    timezone: string
    currency: string
    address: Partial<OrganizationAddress>
  }
}

export interface UpdateOrganizationSettingsPayload {
  profile?: Partial<OrganizationProfile>
  branding?: Partial<OrganizationBrandingSettings>
  notifications?: Partial<OrganizationNotificationSettings>
  security?: Partial<UpdateOrganizationSecuritySettingsPayload>
  workflow?: Partial<OrganizationWorkflowSettings>
  features?: Partial<OrganizationFeatureSettings>
  integrations?: Partial<OrganizationIntegrationsSettings>
}

export function getCurrentOrganization() {
  return apiClient<CurrentOrganizationResponse>("/api/v1/organizations/current")
}

export function getCurrentOrganizationSettings() {
  return apiClient<CurrentOrganizationSettingsResponse>(
    "/api/v1/organizations/current/settings"
  )
}

export function updateCurrentOrganization(payload: UpdateOrganizationPayload) {
  return apiClient<CurrentOrganizationResponse>("/api/v1/organizations/current", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function updateCurrentOrganizationProfile(
  payload: UpdateOrganizationProfilePayload
) {
  return apiClient<CurrentOrganizationResponse>(
    "/api/v1/organizations/current/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export function updateCurrentOrganizationSettings(
  payload: UpdateOrganizationSettingsPayload
) {
  return apiClient<CurrentOrganizationSettingsResponse>(
    "/api/v1/organizations/current/settings",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}
