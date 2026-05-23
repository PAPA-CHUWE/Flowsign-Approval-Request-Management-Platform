"use client"

import { useCallback, useEffect, useState } from "react"
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/api/notifications"

const POLL_INTERVAL_MS = 60_000 // refresh unread count every 60 s

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState("")

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const res = await listNotifications({ limit: 25 })
      const rb = res.responseBody
      setNotifications(rb.items ?? [])
      setUnreadCount(rb.unreadCount ?? 0)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notifications.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // initial load
  useEffect(() => { load() }, [load])

  // background poll for unread count
  useEffect(() => {
    const id = setInterval(() => { load(false) }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  async function markRead(publicId: string) {
    await markNotificationRead(publicId)
    setNotifications((prev) =>
      prev.map((n) => (n.publicId === publicId ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function remove(publicId: string) {
    const wasUnread = notifications.find((n) => n.publicId === publicId)?.read === false
    await deleteNotification(publicId)
    setNotifications((prev) => prev.filter((n) => n.publicId !== publicId))
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1))
  }

  return { notifications, unreadCount, isLoading, error, load, markRead, markAllRead, remove }
}
