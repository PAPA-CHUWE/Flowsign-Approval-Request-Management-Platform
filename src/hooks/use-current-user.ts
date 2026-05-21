"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import {
  AUTH_SESSION_CHANGE_EVENT,
  AUTH_USER_KEY,
  getCurrentUser,
  readStoredAuthUser,
  storeAuthUser,
  type AuthUser,
} from "@/lib/api/auth"

let currentUserRequest: Promise<AuthUser> | null = null
let lastStoredUserRaw: string | null = null
let lastStoredUser: AuthUser | null = null

function readStoredAuthUserSnapshot() {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY)

  if (raw === lastStoredUserRaw) {
    return lastStoredUser
  }

  lastStoredUserRaw = raw
  lastStoredUser = readStoredAuthUser()

  return lastStoredUser
}

function subscribeToAuthSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  window.addEventListener("storage", callback)
  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, callback)

  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, callback)
  }
}

function refreshStoredCurrentUser() {
  currentUserRequest ??= getCurrentUser()
    .then((response) => {
      const nextUser = response.responseBody.user
      storeAuthUser(nextUser)
      return nextUser
    })
    .finally(() => {
      currentUserRequest = null
    })

  return currentUserRequest
}

export function useCurrentUser() {
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    readStoredAuthUserSnapshot,
    () => null
  )
  const [remoteUser, setRemoteUser] = useState<AuthUser | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    let ignore = false

    async function refreshCurrentUser() {
      try {
        const nextUser = await refreshStoredCurrentUser()

        if (!ignore) {
          setRemoteUser(nextUser)
        }
      } catch {
        if (!ignore) {
          setRemoteUser(null)
        }
      } finally {
        if (!ignore) {
          setIsRefreshing(false)
        }
      }
    }

    refreshCurrentUser()

    return () => {
      ignore = true
    }
  }, [])

  const user = remoteUser ?? storedUser

  return { user, isLoading: isRefreshing && !storedUser }
}

export function getUserInitials(user: Pick<AuthUser, "firstName" | "lastName"> | null) {
  if (!user) {
    return "AU"
  }

  const first = user.firstName.trim().charAt(0)
  const last = user.lastName.trim().charAt(0)
  const initials = `${first}${last}`.trim()

  return initials ? initials.toUpperCase() : "AU"
}

export function getUserDisplayName(user: AuthUser | null) {
  if (!user) {
    return "A. User"
  }

  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

export function getUserRoleLabel(user: AuthUser | null) {
  const role = user?.roles[0]

  if (!role) {
    return "Employee"
  }

  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
