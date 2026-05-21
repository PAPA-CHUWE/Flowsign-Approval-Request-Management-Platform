"use client"

import { useEffect } from "react"

import { useCurrentOrganizationSettings } from "@/hooks/use-current-organization-settings"
import type { OrganizationBrandingSettings } from "@/lib/api/organizations"

const DEFAULT_BRANDING = {
  primaryColor: "#0F6E56",
  accentColor: "#1D9E75",
  lightColor: "#9FE1CB",
  paleColor: "#E1F5EE",
}

function normalizeHex(value: string) {
  const hex = value.trim()

  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return hex
  }

  return null
}

function mixHex(hex: string, withHex: string, amount: number) {
  const base = normalizeHex(hex) ?? DEFAULT_BRANDING.primaryColor
  const withColor = normalizeHex(withHex) ?? "#FFFFFF"
  const baseValue = base.slice(1)
  const withValue = withColor.slice(1)

  const channels = [0, 2, 4].map((index) => {
    const baseChannel = Number.parseInt(baseValue.slice(index, index + 2), 16)
    const withChannel = Number.parseInt(withValue.slice(index, index + 2), 16)
    const mixed = Math.round(baseChannel + (withChannel - baseChannel) * amount)

    return mixed.toString(16).padStart(2, "0")
  })

  return `#${channels.join("")}`
}

export function applyOrganizationBranding(
  branding: Pick<
    OrganizationBrandingSettings,
    "primaryColor" | "accentColor" | "useCustomBranding"
  > | null
) {
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement
  const primary =
    branding?.useCustomBranding && normalizeHex(branding.primaryColor)
      ? branding.primaryColor
      : DEFAULT_BRANDING.primaryColor
  const accent =
    branding?.useCustomBranding && normalizeHex(branding.accentColor)
      ? branding.accentColor
      : DEFAULT_BRANDING.accentColor

  root.style.setProperty("--color-brand-teal", primary)
  root.style.setProperty("--color-brand-teal-mid", accent)
  root.style.setProperty("--color-brand-teal-light", mixHex(primary, "#FFFFFF", 0.55))
  root.style.setProperty("--color-brand-teal-pale", mixHex(primary, "#FFFFFF", 0.88))
}

export function OrganizationBrandingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings } = useCurrentOrganizationSettings()

  useEffect(() => {
    applyOrganizationBranding(settings?.branding ?? null)
  }, [settings?.branding])

  return children
}
