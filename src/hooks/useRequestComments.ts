"use client"

import { useEffect, useState } from "react"
import {
  listComments,
  addComment,
  editComment,
  deleteComment,
  type RequestComment,
} from "@/lib/api/comments"

export function useRequestComments(requestPublicId: string | null) {
  const [comments, setComments] = useState<RequestComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!requestPublicId) return
    let ignore = false
    listComments(requestPublicId)
      .then((res) => { if (!ignore) setComments(res.responseBody.comments ?? []) })
      .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : "Could not load comments.") })
      .finally(() => { if (!ignore) setIsLoading(false) })
    return () => { ignore = true }
  }, [requestPublicId])

  async function post(body: string) {
    if (!requestPublicId) return
    const res = await addComment(requestPublicId, body)
    setComments((prev) => [...prev, res.responseBody.comment])
  }

  async function edit(commentPublicId: string, body: string) {
    if (!requestPublicId) return
    const res = await editComment(requestPublicId, commentPublicId, body)
    setComments((prev) =>
      prev.map((c) => (c.publicId === commentPublicId ? res.responseBody.comment : c))
    )
  }

  async function remove(commentPublicId: string) {
    if (!requestPublicId) return
    await deleteComment(requestPublicId, commentPublicId)
    setComments((prev) => prev.filter((c) => c.publicId !== commentPublicId))
  }

  return { comments, isLoading, error, post, edit, remove }
}
