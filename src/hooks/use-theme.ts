"use client"

import { useEffect, useMemo, useSyncExternalStore } from "react"

type Theme = "light" | "dark" | "system"

const THEME_STORAGE_KEY = "theme"
const THEME_CHANGE_EVENT = "flowsign_theme_change"
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)"
const DEFAULT_THEME: Theme = "light"

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light"
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return DEFAULT_THEME
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(stored) ? stored : DEFAULT_THEME
}

function getThemeSnapshot() {
  const theme = getStoredTheme()
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  return `${theme}:${resolvedTheme}`
}

function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const media = window.matchMedia(SYSTEM_DARK_QUERY)

  window.addEventListener("storage", callback)
  window.addEventListener(THEME_CHANGE_EVENT, callback)
  media.addEventListener("change", callback)

  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(THEME_CHANGE_EVENT, callback)
    media.removeEventListener("change", callback)
  }
}

function applyThemeClass(resolvedTheme: string) {
  const root = document.documentElement

  root.classList.toggle("dark", resolvedTheme === "dark")
  root.style.colorScheme = resolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  return children
}

export function useTheme() {
  const snapshot = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => `${DEFAULT_THEME}:${DEFAULT_THEME}`
  )

  return useMemo(() => {
    const [theme, resolvedTheme] = snapshot.split(":") as [Theme, "light" | "dark"]

    return {
      theme,
      resolvedTheme,
      setTheme(nextTheme: Theme) {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
      },
      themes: ["light", "dark", "system"] satisfies Theme[],
    }
  }, [snapshot])
}
