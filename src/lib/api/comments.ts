import { apiClient } from "@/lib/api/client"

export interface RequestComment {
  publicId: string
  requestPublicId: string
  body: string
  internal: boolean
  authorPublicId: string
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface CommentsResponse {
  statusCode: string
  message: string
  responseBody: { comments: RequestComment[] }
}

export interface CommentResponse {
  statusCode: string
  message: string
  responseBody: { comment: RequestComment }
}

export function listComments(requestPublicId: string) {
  return apiClient<CommentsResponse>(
    `/api/v1/requests/${encodeURIComponent(requestPublicId)}/comments`
  )
}

export function addComment(requestPublicId: string, body: string, internal = false) {
  return apiClient<CommentResponse>(
    `/api/v1/requests/${encodeURIComponent(requestPublicId)}/comments`,
    { method: "POST", body: JSON.stringify({ body, internal }) }
  )
}

export function editComment(requestPublicId: string, commentPublicId: string, body: string) {
  return apiClient<CommentResponse>(
    `/api/v1/requests/${encodeURIComponent(requestPublicId)}/comments/${encodeURIComponent(commentPublicId)}`,
    { method: "PATCH", body: JSON.stringify({ body }) }
  )
}

export function deleteComment(requestPublicId: string, commentPublicId: string) {
  return apiClient<{ statusCode: string; message: string; responseBody: Record<string, unknown> }>(
    `/api/v1/requests/${encodeURIComponent(requestPublicId)}/comments/${encodeURIComponent(commentPublicId)}`,
    { method: "DELETE" }
  )
}
