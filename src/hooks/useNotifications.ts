"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  extractNotifications,
  type Notification,
} from "@/lib/api/notifications"

const POLL_INTERVAL_MS = 30_000 // refresh every 30 s

export function useNotifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState("")
  const prevCountRef  = useRef<number | null>(null) // null = initial load not yet done
  const isHiddenRef   = useRef(false)

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const res = await listNotifications({ status: "unread", limit: 25 })
      console.log("[notifications] raw response:", JSON.stringify(res, null, 2))
      const { items, unreadCount: newCount } = extractNotifications(res)
      console.log("[notifications] parsed:", JSON.stringify({ items, newCount }, null, 2))

      setNotifications(items)
      setUnreadCount(newCount)
      setError("")

      // Toast when a new notification arrives after the initial load
      if (prevCountRef.current !== null && newCount > prevCountRef.current) {
        const newest = items[0]
        toast(newest?.title ?? "You have a new notification", {
          description: newest?.body ?? undefined,
          action: {
            label: "View",
            onClick: () => router.push("/approvals"),
          },
        })
      }
      prevCountRef.current = newCount
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notifications.")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // initial load
  useEffect(() => { load() }, [load])

  // pause polling when tab is hidden
  useEffect(() => {
    function onVisibilityChange() {
      isHiddenRef.current = document.visibilityState === "hidden"
      if (document.visibilityState === "visible") load(false)
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [load])

  // background poll
  useEffect(() => {
    const id = setInterval(() => {
      if (!isHiddenRef.current) load(false)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  async function markRead(publicId: string) {
    await markNotificationRead(publicId)
    setNotifications((prev) =>
      prev.map((n) => (n.publicId === publicId ? { ...n, status: "read" as const } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })))
    setUnreadCount(0)
  }

  async function remove(publicId: string) {
    const wasUnread = notifications.find((n) => n.publicId === publicId)?.status === "unread"
    await deleteNotification(publicId)
    setNotifications((prev) => prev.filter((n) => n.publicId !== publicId))
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1))
  }

  return { notifications, unreadCount, isLoading, error, load, markRead, markAllRead, remove }
}
